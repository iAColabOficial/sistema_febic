// backend/src/routes/coordinator.ts
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { coordinatorOnly } from '../middleware/coordinatorAuth';
import * as coordinatorController from '../controllers/coordinatorController';

const router = express.Router();

// Aplicar autenticação e verificação de role em todas as rotas
router.use(authenticateToken);
router.use(coordinatorOnly);

// Dashboard
router.get('/dashboard/stats', coordinatorController.getDashboardStats);
router.get('/dashboard/report', coordinatorController.getDistributionReport);

// Projetos
router.get('/projects/distribution', coordinatorController.getProjectsForDistribution);
router.get('/projects/:projectId/evaluations', coordinatorController.getProjectEvaluations);

// Avaliadores
router.get('/evaluators/available', coordinatorController.getAvailableEvaluators);

// Distribuição
router.post('/distribute', coordinatorController.distributeProject);
router.post('/distribute/auto', coordinatorController.autoDistributeProjects);
router.delete('/evaluations/:avaliacaoId', coordinatorController.removeEvaluator);

export default router;