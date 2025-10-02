// backend/src/routes/feiraAfiliada.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { roleMiddleware } from '../middleware/roleMiddleware';
import * as feiraController from '../controllers/feiraAfiliadaController';

const router = Router();

// ========== ROTAS PÚBLICAS ==========
// Buscar feiras ativas (para dropdown na submissão)
router.get('/publicas', feiraController.buscarFeirasPublicas);

// Solicitar afiliação (público ou autenticado)
router.post('/solicitar', feiraController.solicitarAfiliacao);

// ========== ROTAS ADMIN ==========
// Listar solicitações pendentes
router.get(
  '/solicitacoes',
  authenticateToken ,
  roleMiddleware(['ADMINISTRADOR']),
  feiraController.listarSolicitacoesPendentes
);

// Aprovar feira
router.put(
  '/aprovar/:id',
  authenticateToken ,
  roleMiddleware(['ADMINISTRADOR']),
  feiraController.aprovarFeira
);

// Rejeitar feira
router.delete(
  '/rejeitar/:id',
  authenticateToken ,
  roleMiddleware(['ADMINISTRADOR']),
  feiraController.rejeitarFeira
);

// Listar todas as feiras ativas
router.get(
  '/ativas',
  authenticateToken ,
  roleMiddleware(['ADMINISTRADOR']),
  feiraController.listarFeirasAtivas
);

// ========== ROTAS FEIRA AFILIADA ==========
// Dashboard da feira
router.get(
  '/:feiraId/dashboard',
  authenticateToken ,
  roleMiddleware(['FEIRA_AFILIADA', 'ADMINISTRADOR']),
  feiraController.dashboardFeira
);

// Buscar projetos elegíveis para credenciamento
router.get(
  '/:feiraId/projetos-elegiveis',
  authenticateToken ,
  roleMiddleware(['FEIRA_AFILIADA', 'ADMINISTRADOR']),
  feiraController.buscarProjetosElegiveis
);

// Credenciar projeto
router.post(
  '/:feiraId/credenciar/:projectId',
  authenticateToken ,
  roleMiddleware(['FEIRA_AFILIADA', 'ADMINISTRADOR']),
  feiraController.credenciarProjeto
);

// Listar projetos credenciados pela feira
router.get(
  '/:feiraId/credenciados',
 authenticateToken ,
  roleMiddleware(['FEIRA_AFILIADA', 'ADMINISTRADOR']),
  feiraController.listarProjetosCredenciados
);

// Remover credencial de projeto
router.delete(
  '/:feiraId/credenciar/:projectId',
  authenticateToken ,
  roleMiddleware(['FEIRA_AFILIADA', 'ADMINISTRADOR']),
  feiraController.removerCredencial
);

export default router;