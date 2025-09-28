// backend/src/middleware/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ 
        message: 'Acesso negado',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};