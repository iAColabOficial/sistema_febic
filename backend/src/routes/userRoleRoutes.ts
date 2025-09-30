// backend/src/routes/userRoleRoutes.ts
import express from 'express';
import {
  getMyRoleInfo,
  getUserRoleInfoById,
  getDualRoleUsers
} from '../controllers/userRoleController';
import { authenticateWithDualRole } from '../middleware/dualRoleAuth';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/users/me/role-info
 * @desc    Obtém informações de role do usuário atual
 * @access  Private (qualquer usuário autenticado)
 */
router.get('/me/role-info', authenticateWithDualRole, getMyRoleInfo);

/**
 * @route   GET /api/users/:userId/role-info
 * @desc    Obtém informações de role de um usuário específico
 * @access  Private (apenas Admin)
 */
router.get('/:userId/role-info', authenticateWithDualRole, requireAdmin, getUserRoleInfoById);

/**
 * @route   GET /api/users/dual-role-users
 * @desc    Lista todos os usuários com dual role
 * @access  Private (apenas Admin)
 */
router.get('/dual-role-users', authenticateWithDualRole, requireAdmin, getDualRoleUsers);

export default router;