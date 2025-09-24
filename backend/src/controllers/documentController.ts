import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/multerConfig';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Tipos de documentos baseados no regulamento FEBIC
export const DOCUMENT_TYPES = {
  PROJETO_COMPLETO: { name: 'Projeto Completo', required: true, maxSize: 20 },
  RESUMO_EXECUTIVO: { name: 'Resumo Executivo', required: true, maxSize: 5 },
  DIARIO_BORDO: { name: 'Diário de Bordo', required: true, maxSize: 10 },
  AUTORIZACAO_IMAGEM: { name: 'Autorização de Imagem', required: true, maxSize: 5 },
  AUTORIZACAO_RESPONSAVEL: { name: 'Autorização de Responsável', required: false, maxSize: 5 },
  COMPROVANTE_PAGAMENTO: { name: 'Comprovante de Pagamento', required: false, maxSize: 5 },
  DECLARACAO_ORIENTADOR: { name: 'Declaração do Orientador', required: true, maxSize: 5 },
  DECLARACAO_INSTITUICAO: { name: 'Declaração da Instituição', required: true, maxSize: 5 },
  CERTIFICADO_APRESENTACAO: { name: 'Certificado de Apresentação', required: false, maxSize: 5 },
  RELATORIO_TECNICO: { name: 'Relatório Técnico', required: false, maxSize: 10 },
  ANEXOS_TECNICOS: { name: 'Anexos Técnicos', required: false, maxSize: 20 },
  FOTOS_PROJETO: { name: 'Fotos do Projeto', required: false, maxSize: 10 },
  VIDEOS_PROJETO: { name: 'Vídeos do Projeto', required: false, maxSize: 50 },
  PLANILHA_DADOS: { name: 'Planilha de Dados', required: false, maxSize: 10 },
  OUTROS_DOCUMENTOS: { name: 'Outros Documentos', required: false, maxSize: 10 }
};

// Upload de documento
export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { projectId } = req.params;
    const { documentType, description } = req.body;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // Verificar se o usuário tem acesso ao projeto
    const hasAccess = await checkProjectAccess(projectId, userId, userRole);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Sem permissão para este projeto' 
      });
    }

    // Verificar se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo foi enviado' 
      });
    }

    // Validar tipo de documento
    if (!DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipo de documento inválido' 
      });
    }

    // Verificar se já existe um documento deste tipo (alguns tipos são únicos)
    const existingDoc = await prisma.projectDocument.findFirst({
      where: {
        projectId,
        name: documentType
      }
    });

    if (existingDoc) {
      // Remover arquivo antigo
      try {
        fs.unlinkSync(existingDoc.filePath);
      } catch (error) {
        console.log('Erro ao remover arquivo antigo:', error);
      }

      // Atualizar documento existente
      const updatedDocument = await prisma.projectDocument.update({
        where: { id: existingDoc.id },
        data: {
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          description: description || '',
          version: existingDoc.version + 1,
          isApproved: null, // Resetar aprovação
          rejectionReason: null
        }
      });

      return res.json({
        success: true,
        data: updatedDocument,
        message: 'Documento atualizado com sucesso'
      });
    }

    // Criar novo documento
    const document = await prisma.projectDocument.create({
      data: {
        projectId,
        name: documentType,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        description: description || '',
        isRequired: DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES].required
      }
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Documento enviado com sucesso'
    });

  } catch (error) {
    console.error('Erro no upload de documento:', error);
    
    // Remover arquivo se houve erro
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao remover arquivo após falha:', unlinkError);
      }
    }

    const message = error instanceof Error ? error.message : 'Erro interno';
    res.status(500).json({ success: false, message });
  }
};

// Listar documentos de um projeto
export const getProjectDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { projectId } = req.params;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // Verificar acesso ao projeto
    const hasAccess = await checkProjectAccess(projectId, userId, userRole);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Sem permissão para este projeto' 
      });
    }

    // Buscar documentos do projeto
    const documents = await prisma.projectDocument.findMany({
      where: { projectId },
      orderBy: [
        { isRequired: 'desc' },
        { name: 'asc' },
        { uploadedAt: 'desc' }
      ]
    });

    // Criar lista de documentos esperados vs enviados
    const documentStatus = Object.entries(DOCUMENT_TYPES).map(([key, config]) => {
      const existingDoc = documents.find(doc => doc.name === key);
      return {
        type: key,
        name: config.name,
        required: config.required,
        maxSize: config.maxSize,
        status: existingDoc ? 'uploaded' : 'pending',
        document: existingDoc || null
      };
    });

    res.json({
      success: true,
      data: {
        documents: documentStatus,
        uploadedCount: documents.length,
        requiredCount: Object.values(DOCUMENT_TYPES).filter(d => d.required).length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Download de documento
export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { documentId } = req.params;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // Buscar documento
    const document = await prisma.projectDocument.findUnique({
      where: { id: documentId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            members: { select: { userId: true } },
            orientadores: { select: { userId: true } }
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
    const hasAccess = await checkProjectAccess(document.projectId, userId, userRole);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Sem permissão para este documento' 
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
      data: { downloadCount: document.downloadCount + 1 }
    });

    // Enviar arquivo
    const filename = path.basename(document.filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', document.mimeType);
    
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Excluir documento
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { documentId } = req.params;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // Buscar documento
    const document = await prisma.projectDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Documento não encontrado' 
      });
    }

    // Verificar permissão
    const hasAccess = await checkProjectAccess(document.projectId, userId, userRole);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Sem permissão para excluir este documento' 
      });
    }

    // Remover arquivo físico
    try {
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (error) {
      console.log('Erro ao remover arquivo físico:', error);
    }

    // Remover do banco
    await prisma.projectDocument.delete({
      where: { id: documentId }
    });

    res.json({
      success: true,
      message: 'Documento excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Aprovar/Rejeitar documento (Admin/Avaliador)
export const reviewDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { documentId } = req.params;
    const { approved, rejectionReason } = req.body;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // Apenas admin/avaliador pode aprovar
    if (userRole !== 'ADMINISTRADOR' && userRole !== 'AVALIADOR') {
      return res.status(403).json({ 
        success: false, 
        message: 'Sem permissão para revisar documentos' 
      });
    }

    const document = await prisma.projectDocument.update({
      where: { id: documentId },
      data: {
        isApproved: approved,
        rejectionReason: approved ? null : rejectionReason
      }
    });

    res.json({
      success: true,
      data: document,
      message: approved ? 'Documento aprovado' : 'Documento rejeitado'
    });

  } catch (error) {
    console.error('Erro ao revisar documento:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Obter informações de um documento específico
export const getDocumentInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { documentId } = req.params;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    const document = await prisma.projectDocument.findUnique({
      where: { id: documentId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            ownerId: true
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
    const hasAccess = await checkProjectAccess(document.projectId, userId, userRole);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Sem permissão para este documento' 
      });
    }

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('Erro ao buscar informações do documento:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Função auxiliar para verificar acesso ao projeto
async function checkProjectAccess(projectId: string, userId: string, userRole: string): Promise<boolean> {
  if (userRole === 'ADMINISTRADOR') {
    return true;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { select: { userId: true } },
      orientadores: { select: { userId: true } }
    }
  });

  if (!project) {
    return false;
  }

  // Owner sempre tem acesso
  if (project.ownerId === userId) {
    return true;
  }

  // Verificar se é membro
  if (project.members.some(member => member.userId === userId)) {
    return true;
  }

  // Verificar se é orientador
  if (project.orientadores.some(orientador => orientador.userId === userId)) {
    return true;
  }

  return false;
}