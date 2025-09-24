import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadSingle } from '../middleware/multerConfig';
import {
  uploadDocument,
  getProjectDocuments,
  downloadDocument,
  deleteDocument,
  reviewDocument,
  getDocumentInfo,
  DOCUMENT_TYPES
} from '../controllers/documentController';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/documents/types - Obter tipos de documentos disponíveis
router.get('/documents/types', (req, res) => {
  res.json({
    success: true,
    data: DOCUMENT_TYPES
  });
});

// POST /api/documents/projects/:projectId/upload - Upload de documento
router.post('/documents/projects/:projectId/upload', 
  uploadSingle, 
  uploadDocument
);

// GET /api/documents/projects/:projectId - Listar documentos de um projeto
router.get('/documents/projects/:projectId', getProjectDocuments);

// GET /api/documents/:documentId - Obter informações de um documento
router.get('/documents/:documentId', getDocumentInfo);

// GET /api/documents/:documentId/download - Download de documento
router.get('/documents/:documentId/download', downloadDocument);

// DELETE /api/documents/:documentId - Excluir documento
router.delete('/documents/:documentId', deleteDocument);

// PUT /api/documents/:documentId/review - Aprovar/Rejeitar documento (Admin/Avaliador)
router.put('/documents/:documentId/review', reviewDocument);

export default router;