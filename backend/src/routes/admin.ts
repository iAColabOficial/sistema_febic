import express from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = express.Router();

// Middleware para todas as rotas admin
router.use(authenticateToken);
router.use(adminOnly);

// =================== ROTAS DE USUÁRIOS ===================

// Listar usuários com paginação e filtros
router.get('/users', AdminController.getUsers);

// Obter usuário específico
router.get('/users/:id', AdminController.getUserById);

// Criar novo usuário
router.post('/users', AdminController.createUser);

// Atualizar usuário
router.put('/users/:id', AdminController.updateUser);

// Deletar usuário
router.delete('/users/:id', AdminController.deleteUser);

// Resetar senha do usuário
router.post('/users/:id/reset-password', AdminController.resetUserPassword);

// =================== ROTAS DE PROJETOS ===================

// Listar todos os projetos (admin view)
router.get('/projects', AdminController.getAllProjects);

// Obter projeto específico
router.get('/projects/:id', AdminController.getProjectById);

// Atualizar projeto
router.put('/projects/:id', AdminController.updateProject);

// Deletar projeto
router.delete('/projects/:id', AdminController.deleteProject);

// Atualizar status de projetos em lote
router.post('/projects/bulk-status', AdminController.updateProjectsStatus);

// =================== ESTATÍSTICAS E DASHBOARD ===================

// Estatísticas gerais do sistema
router.get('/stats', AdminController.getStats);

// Atividades recentes (compatibilidade)
router.get('/recent-activities', AdminController.getRecentActivities);

// Atividades detalhadas
router.get('/activities', AdminController.getDetailedActivities);

export default router;