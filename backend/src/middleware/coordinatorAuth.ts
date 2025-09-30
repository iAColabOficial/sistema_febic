// backend/src/middleware/coordinatorAuth.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const coordinatorOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Permite acesso se for COORDENADOR_AVALIACOES ou ADMINISTRADOR
    if (req.user.role !== UserRole.COORDENADOR_AVALIACOES && 
        req.user.role !== UserRole.ADMINISTRADOR) {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas coordenadores de avaliação podem acessar este recurso.' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware coordinatorOnly:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};