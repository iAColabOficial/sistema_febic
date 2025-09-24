import express from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = express.Router();

// Middleware para todas as rotas admin
router.use(authenticateToken);
router.use(adminOnly);

// Rotas de usuários
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Estatísticas
router.get('/stats', AdminController.getStats);

// Atividades recentes
router.get('/activities', AdminController.getRecentActivities);

export default router;