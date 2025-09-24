import { Router } from 'express';
import { register, login, getMe, searchUserByCPF,logout } from '../controllers/authController'; // Adicionar searchUserByCPF
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rotas pÃºblicas
router.post('/register', register);
router.post('/login', login);

// Rotas protegidas
router.get('/me', authenticateToken, getMe);
router.get('/search-cpf/:cpf', authenticateToken, searchUserByCPF); // Nova rota
router.post('/logout', authenticateToken, logout);

export default router;