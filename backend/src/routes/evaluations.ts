import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluationController';
import { authenticateToken } from '../middleware/auth';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// === ROTAS DO AVALIADOR ===

// Buscar projetos atribuídos ao avaliador
router.get('/my-evaluations', EvaluationController.getMyEvaluations);

// Buscar detalhes de uma avaliação específica
router.get('/:id/details', EvaluationController.getEvaluationDetails);

// Salvar/atualizar avaliação
router.put('/:id', EvaluationController.saveEvaluation);

// Finalizar avaliação
router.post('/:id/complete', EvaluationController.completeEvaluation);

// === ROTAS ADMINISTRATIVAS ===

// Distribuir avaliadores automaticamente para todos os projetos
router.post('/distribute/all', 
  roleMiddleware(['ADMINISTRADOR']), 
  EvaluationController.distributeAllEvaluators
);

// Distribuir avaliadores para um projeto específico
router.post('/distribute/project/:projectId', 
  roleMiddleware(['ADMINISTRADOR']), 
  EvaluationController.distributeProjectEvaluators
);

// Atribuir avaliador manualmente
router.post('/assign', 
  roleMiddleware(['ADMINISTRADOR']), 
  EvaluationController.assignEvaluator
);

// Remover avaliador
router.delete('/projects/:projectId/evaluators/:evaluatorId', 
  roleMiddleware(['ADMINISTRADOR']), 
  EvaluationController.removeEvaluator
);

// Listar todas as avaliações (admin)
router.get('/admin/all', 
  roleMiddleware(['ADMINISTRADOR']), 
  EvaluationController.getAllEvaluations
);

// Buscar avaliadores disponíveis para um projeto
router.get('/admin/projects/:projectId/available-evaluators', 
  roleMiddleware(['ADMINISTRADOR']), 
  EvaluationController.getAvailableEvaluators
);

// Estatísticas do sistema de avaliação
router.get('/admin/stats', 
  roleMiddleware(['ADMINISTRADOR']), 
  EvaluationController.getEvaluationStats
);

export default router;