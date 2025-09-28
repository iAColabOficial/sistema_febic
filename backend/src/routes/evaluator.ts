// backend/src/routes/evaluator.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  applyForEvaluator,
  getEvaluatorApplications,
  evaluateApplication,
  getMyApplicationStatus
} from '../controllers/evaluatorController';

const router = Router();

// Aplicar para ser avaliador
router.post('/apply', authenticateToken, applyForEvaluator);

// Buscar status da própria candidatura
router.get('/my-application', authenticateToken, getMyApplicationStatus);

// Rotas administrativas
router.get('/applications', authenticateToken, getEvaluatorApplications);
router.patch('/applications/:id/evaluate', authenticateToken, evaluateApplication);

export default router;