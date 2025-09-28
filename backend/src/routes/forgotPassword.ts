// backend/src/routes/forgotPassword.ts - VERSÃO SIMPLIFICADA
import { Router } from 'express';
import {
  requestPasswordReset,
  verifyResetToken,
  resetPasswordWithToken
} from '../controllers/forgotPasswordController';

const router = Router();

// POST /api/auth/forgot-password
// Body: { email: "user@example.com" }
router.post('/', requestPasswordReset);

// GET /api/auth/forgot-password/verify/:token
// Verifica se o token é válido
router.get('/verify/:token', verifyResetToken);

// POST /api/auth/forgot-password/reset/:token
// Body: { newPassword: "novaSenha123" }
router.post('/reset/:token', resetPasswordWithToken);

export default router;