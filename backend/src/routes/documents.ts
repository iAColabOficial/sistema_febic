// backend/src/routes/documents.ts (VERSÃO CORRIGIDA)
import { Router } from 'express';
import {
  uploadDocument,
  getProjectDocuments,
  downloadDocument,
  deleteDocument,
  getDocumentInfo
} from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';
import { uploadSingle } from '../middleware/multerConfig';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ========================================
// ROTAS DE UPLOAD
// ========================================

// Upload de documento único para um projeto
router.post(
  '/projects/:projectId/documents', 
  uploadSingle, 
  uploadDocument
);

// ========================================
// ROTAS DE CONSULTA
// ========================================

// Listar documentos de um projeto
// Query params: ?public_only=true
router.get('/projects/:projectId/documents', getProjectDocuments);

// Obter informações detalhadas de um documento
router.get('/documents/:documentId', getDocumentInfo);

// ========================================
// ROTAS DE DOWNLOAD
// ========================================

// Download de documento específico
router.get('/documents/:documentId/download', downloadDocument);

// Visualizar documento (sem download) - para PDFs/imagens
router.get('/documents/:documentId/view', async (req: Request, res: Response) => {
  try {
    // Esta rota é similar ao download, mas define headers para visualização
    req.url = req.url.replace('/view', '/download');
    
    // Chama a função de download mas modifica os headers
    const originalSend = res.setHeader;
    res.setHeader = function(name: string, value: string | number | readonly string[]) {
      if (name === 'Content-Disposition') {
        // Para visualização, usa 'inline' em vez de 'attachment'
        const filename = value.toString().split('filename=')[1];
        return originalSend.call(this, name, `inline; filename=${filename}`);
      }
      return originalSend.call(this, name, value);
    };
    
    return downloadDocument(req as any, res);
  } catch (error) {
    console.error('❌ Erro na visualização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ========================================
// ROTAS DE GESTÃO
// ========================================

// Atualizar informações do documento (nome, descrição, etc.)
router.patch('/documents/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { name, description, isRequired, isPublic } = req.body;
    const userId = (req as any).user?.userId;

    // Verificar se documento existe e se usuário tem permissão
    const document = await prisma.projectDocument.findFirst({
      where: { id: documentId },
      include: {
        project: {
          select: {
            ownerId: true,
            status: true,
            members: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    // Verificar permissões
    const isOwner = document.project.ownerId === userId;
    const isMember = document.project.members.some((member: any) => member.userId === userId);
    const isAdmin = (req as any).user?.role === 'ADMINISTRADOR';

    const canEdit = isOwner || isAdmin || (isMember && document.project.status === 'RASCUNHO');

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para editar este documento'
      });
    }

    // Atualizar documento
    const updatedDocument = await prisma.projectDocument.update({
      where: { id: documentId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isRequired !== undefined && { isRequired: Boolean(isRequired) }),
        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) })
      }
    });

    res.json({
      success: true,
      message: 'Documento atualizado com sucesso',
      data: updatedDocument
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Deletar documento
router.delete('/documents/:documentId', deleteDocument);

// ========================================
// ROTAS ADMINISTRATIVAS
// ========================================

// Listar todos os documentos (apenas admin)
router.get('/admin/documents', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (userRole !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }

    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.projectDocument.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        },
        orderBy: { uploadedAt: 'desc' }
      }),
      prisma.projectDocument.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar documentos (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de documentos (apenas admin)
router.get('/admin/documents/stats', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (userRole !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }

    const stats = await prisma.projectDocument.aggregate({
      _count: { id: true },
      _sum: { fileSize: true, downloadCount: true },
      _avg: { fileSize: true }
    });

    const publicDocuments = await prisma.projectDocument.count({
      where: { isPublic: true }
    });

    const requiredDocuments = await prisma.projectDocument.count({
      where: { isRequired: true }
    });

    const typeStats = await prisma.projectDocument.groupBy({
      by: ['mimeType'],
      _count: { id: true }
    });

    res.json({
      success: true,
      data: {
        total: stats._count.id || 0,
        totalSize: stats._sum.fileSize || 0,
        averageSize: stats._avg.fileSize || 0,
        totalDownloads: stats._sum.downloadCount || 0,
        publicDocuments,
        requiredDocuments,
        byType: typeStats
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ========================================

// Tratamento de erros específicos do multer
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof Error) {
    if (error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 20MB'
      });
    }
    
    if (error.message.includes('Too many files')) {
      return res.status(400).json({
        success: false,
        message: 'Muitos arquivos. Máximo: 5 arquivos por upload'
      });
    }
    
    if (error.message.includes('Tipo de arquivo não permitido')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  next(error);
});

export default router;