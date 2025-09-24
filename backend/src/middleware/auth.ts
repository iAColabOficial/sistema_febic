import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }

    req.user = {
      userId: String(decoded.userId),
      email: decoded.email,
      role: decoded.role
    };

    next();
  });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Não autenticado'
    });
  }

  if (req.user.role !== 'ADMINISTRADOR') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }

  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    const roleMap: { [key: string]: string } = {
      'ADMIN': 'ADMINISTRADOR',
      'AUTHOR': 'AUTOR',
      'EVALUATOR': 'AVALIADOR'
    };

    const userRole = req.user.role;
    const mappedAllowedRoles = allowedRoles.map(role => roleMap[role] || role);

    if (!mappedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Roles permitidos: ${mappedAllowedRoles.join(', ')}`
      });
    }

    next();
  };
};

export const requireAdministrator = requireRole(['ADMINISTRADOR']);
export const requireAuthorOrAdmin = requireRole(['AUTOR', 'ADMINISTRADOR']);
export const requireEvaluatorOrAdmin = requireRole(['AVALIADOR', 'ADMINISTRADOR']);