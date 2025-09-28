import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './auth';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    req.user = {
      id: decoded.userId,  // Mude de apenas id para mapear de userId
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Permissões insuficientes.' 
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMINISTRADOR']);
export const requireEvaluator = requireRole(['ADMINISTRADOR', 'AVALIADOR']);
export const requireOrientador = requireRole(['ADMINISTRADOR', 'ORIENTADOR', 'AVALIADOR']);