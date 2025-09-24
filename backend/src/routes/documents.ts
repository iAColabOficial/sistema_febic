import { Router } from 'express';
import { auth } from '../middleware/auth';
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
router.use(auth);

// GET /api/documents/types - Obter tipos de documentos disponíveis
router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: DOCUMENT_TYPES
  });
});

// POST /api/documents/projects/:projectId/upload - Upload de documento
router.post('/projects/:projectId/upload', 
  uploadSingle, 
  uploadDocument
);

// GET /api/documents/projects/:projectId - Listar documentos de um projeto
router.get('/projects/:projectId', getProjectDocuments);

// GET /api/documents/:documentId - Obter informações de um documento
router.get('/:documentId', getDocumentInfo);

// GET /api/documents/:documentId/download - Download de documento
router.get('/:documentId/download', downloadDocument);

// DELETE /api/documents/:documentId - Excluir documento
router.delete('/:documentId', deleteDocument);

// PUT /api/documents/:documentId/review - Aprovar/Rejeitar documento (Admin/Avaliador)
router.put('/:documentId/review', reviewDocument);

export default router;