import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string; // ← String ao invés de UserRole enum
  };
}

const ALLOWED_ROLES = ['COORDENADOR_AVALIACOES', 'ADMINISTRADOR'];

export const coordinatorOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!ALLOWED_ROLES.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Only evaluation coordinators can access this resource.' 
      });
    }

    next();
  } catch (error) {
    console.error('Error in coordinatorOnly middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};