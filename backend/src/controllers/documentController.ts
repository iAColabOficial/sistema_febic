// backend/src/controllers/documentController.ts (VERSÃO CORRIGIDA)
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import { deleteFile, formatFileSize } from '../middleware/multerConfig';

const prisma = new PrismaClient();

// Interfaces para tipagem (baseadas no schema real)
interface UploadDocumentBody {
  name?: string;
  description?: string;
  isRequired?: boolean;
  isPublic?: boolean;
}

interface DocumentResponse {
  id: string;
  name: string;
  description?: string | null;
  fileSize: number;
  fileSizeFormatted: string;
  mimeType: string;
  isRequired: boolean;
  isPublic: boolean;
  downloadCount: number;
  uploadedAt: Date;
  projectId: string;
}

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description, isRequired = false, isPublic = false } = req.body as UploadDocumentBody;
    const userId = req.user?.userId;

    // Validar arquivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo é obrigatório'
      });
    }

    // Validar parâmetros
    if (!projectId) {
      deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'ID do projeto é obrigatório'
      });
    }

    // Verificar se o projeto existe e se o usuário tem permissão
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          // Verificar se é membro do projeto
          { 
            members: {
              some: { userId: userId }
            }
          },
          // Admin pode fazer upload em qualquer projeto
          ...(req.user?.role === 'ADMINISTRADOR' ? [{}] : [])
        ]
      },
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      }
    });

    if (!project) {
      deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado ou você não tem permissão'
      });
    }

    // Verificar limite de documentos (máximo 20 por projeto)
    if (project._count.documents >= 20) {
      deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Limite máximo de 20 documentos por projeto atingido'
      });
    }

    // Verificar se já existe documento com o mesmo nome
    const existingDoc = await prisma.projectDocument.findFirst({
      where: {
        projectId,
        name: name || req.file.originalname
      }
    });

    if (existingDoc) {
      deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Já existe um documento com este nome no projeto'
      });
    }

    // Criar registro do documento (APENAS com campos que existem no schema)
    const document = await prisma.projectDocument.create({
      data: {
        projectId,
        name: name || req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        description: description || null,
        isRequired: Boolean(isRequired),
        isPublic: Boolean(isPublic)
        // Removido: documentType (não existe no schema)
      }
    });

    // Log da ação
    console.log(`📁 Upload realizado: ${document.name} por usuário ${userId} no projeto ${projectId}`);

    // Resposta formatada (APENAS com campos que existem)
    const response: DocumentResponse = {
      id: document.id,
      name: document.name,
      description: document.description,
      fileSize: document.fileSize,
      fileSizeFormatted: formatFileSize(document.fileSize),
      mimeType: document.mimeType,
      isRequired: document.isRequired,
      isPublic: document.isPublic,
      downloadCount: document.downloadCount,
      uploadedAt: document.uploadedAt,
      projectId: document.projectId
    };

    res.status(201).json({
      success: true,
      message: 'Documento enviado com sucesso',
      data: response
    });

  } catch (error) {
    // Deletar arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      deleteFile(req.file.path);
    }
    
    console.error('❌ Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getProjectDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;
    const { public_only } = req.query;

    // Verificar permissão
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { 
            members: {
              some: { userId: userId }
            }
          },
          ...(req.user?.role === 'ADMINISTRADOR' ? [{}] : []),
          // Se for público, qualquer um pode ver documentos públicos
          ...(public_only === 'true' ? [{}] : [])
        ]
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Filtros para busca
    const whereClause: any = { 
      projectId,
      ...(public_only === 'true' ? { isPublic: true } : {})
      // Removido: filtro por type (documentType não existe)
    };

    const documents = await prisma.projectDocument.findMany({
      where: whereClause,
      orderBy: [
        { isRequired: 'desc' },  // Documentos obrigatórios primeiro
        { uploadedAt: 'desc' }   // Mais recentes primeiro
      ],
      select: {
        id: true,
        name: true,
        description: true,
        fileSize: true,
        mimeType: true,
        isRequired: true,
        isPublic: true,
        downloadCount: true,
        uploadedAt: true
        // Removido: documentType (não existe no schema)
      }
    });

    // Formatar resposta
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      fileSizeFormatted: formatFileSize(doc.fileSize)
    }));

    res.json({
      success: true,
      data: formattedDocuments,
      count: formattedDocuments.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;

    const document = await prisma.projectDocument.findFirst({
      where: { id: documentId },
      include: {
        project: {
          select: {
            id: true,
            ownerId: true,
            title: true,
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

    // Verificar permissão mais detalhada
    const isOwner = document.project.ownerId === userId;
    const isMember = document.project.members.some(member => member.userId === userId);
    const isAdmin = req.user?.role === 'ADMINISTRADOR';
    const isPublicDoc = document.isPublic;

    const hasPermission = isOwner || isMember || isAdmin || isPublicDoc;

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar este documento'
      });
    }

    // Verificar se arquivo existe
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado no servidor'
      });
    }

    // Incrementar contador de downloads
    await prisma.projectDocument.update({
      where: { id: documentId },
      data: { downloadCount: { increment: 1 } }
    });

    // Log do download
    console.log(`📥 Download: ${document.name} por usuário ${userId}`);

    // Enviar arquivo
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.name)}"`);
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Length', document.fileSize.toString());
    
    res.sendFile(path.resolve(document.filePath));

  } catch (error) {
    console.error('❌ Erro no download:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;

    const document = await prisma.projectDocument.findFirst({
      where: { id: documentId },
      include: {
        project: {
          select: {
            id: true,
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
    const isMember = document.project.members.some(member => member.userId === userId);
    const isAdmin = req.user?.role === 'ADMINISTRADOR';

    const canDelete = isOwner || isAdmin || (isMember && document.project.status === 'RASCUNHO');

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar este documento'
      });
    }

    // Não pode deletar se projeto já foi submetido (exceto admin)
    if (document.project.status !== 'RASCUNHO' && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar documentos de projetos já submetidos'
      });
    }

    // Deletar arquivo físico
    const fileDeleted = deleteFile(document.filePath);
    
    // Deletar registro
    await prisma.projectDocument.delete({
      where: { id: documentId }
    });

    // Log da ação
    console.log(`🗑️ Documento deletado: ${document.name} por usuário ${userId}`);

    res.json({
      success: true,
      message: 'Documento deletado com sucesso',
      fileDeleted
    });

  } catch (error) {
    console.error('❌ Erro ao deletar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Nova função: Obter informações de um documento específico
export const getDocumentInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;

    const document = await prisma.projectDocument.findFirst({
      where: { id: documentId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            ownerId: true,
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

    // Verificar permissão
    const isOwner = document.project.ownerId === userId;
    const isMember = document.project.members.some(member => member.userId === userId);
    const isAdmin = req.user?.role === 'ADMINISTRADOR';
    const isPublicDoc = document.isPublic;

    const hasPermission = isOwner || isMember || isAdmin || isPublicDoc;

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar este documento'
      });
    }

    const response = {
      id: document.id,
      name: document.name,
      description: document.description,
      fileSize: document.fileSize,
      fileSizeFormatted: formatFileSize(document.fileSize),
      mimeType: document.mimeType,
      isRequired: document.isRequired,
      isPublic: document.isPublic,
      downloadCount: document.downloadCount,
      uploadedAt: document.uploadedAt,
      project: {
        id: document.project.id,
        title: document.project.title
      }
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ Erro ao buscar informações do documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Re-exportar o middleware para manter compatibilidade
export { uploadSingle as upload } from '../middleware/multerConfig';