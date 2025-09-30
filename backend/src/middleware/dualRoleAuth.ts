// backend/src/middleware/dualRoleAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    roles?: string[]; // Array de roles para dual role
    isOrientador?: boolean;
    isAvaliador?: boolean;
  };
}

/**
 * Middleware que autentica o token e verifica se o usuário tem dual role
 */
export const authenticateWithDualRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', async (err, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }

    try {
      // Buscar usuário no banco para verificar roles atualizados
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          evaluatorApplications: {
            where: { status: 'APROVADA' },
            take: 1
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Criar array de roles baseado no role principal e candidaturas aprovadas
      const roles: string[] = [user.role];
      
      // Se é orientador E tem candidatura aprovada como avaliador
      const hasApprovedEvaluatorApplication = user.evaluatorApplications.length > 0;
      
      if (user.role === 'ORIENTADOR' && hasApprovedEvaluatorApplication) {
        roles.push('AVALIADOR');
      }

      req.user = {
        userId: String(user.id),
        email: user.email,
        role: user.role,
        roles: roles,
        isOrientador: user.role === 'ORIENTADOR',
        isAvaliador: user.role === 'AVALIADOR' || hasApprovedEvaluatorApplication
      };

      next();
    } catch (error) {
      console.error('Erro ao verificar dual role:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar permissões'
      });
    }
  });
};

/**
 * Middleware que verifica se o usuário tem PELO MENOS UM dos roles permitidos
 */
export const requireAnyRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    const userRoles = req.user.roles || [req.user.role];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Roles permitidos: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware específico para orientadores (incluindo aqueles com dual role)
 */
export const requireOrientador = requireAnyRole(['ORIENTADOR', 'ADMINISTRADOR']);

/**
 * Middleware específico para avaliadores (incluindo orientadores com candidatura aprovada)
 */
export const requireAvaliador = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Não autenticado'
    });
  }

  // Verifica se é avaliador direto OU orientador com dual role
  if (req.user.isAvaliador || req.user.role === 'ADMINISTRADOR') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Acesso negado. Apenas avaliadores podem acessar este recurso.'
  });
};

/**
 * Middleware que verifica se o usuário pode acessar recursos de avaliação
 */
export const requireEvaluationAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Não autenticado'
    });
  }

  try {
    // Buscar avaliação específica se houver ID na rota
    const evaluationId = req.params.id || req.params.evaluationId;
    
    if (evaluationId) {
      const evaluation = await prisma.projectAvaliacao.findUnique({
        where: { id: evaluationId }
      });

      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      // Verificar se o usuário é o avaliador responsável ou admin
      if (
        evaluation.avaliadorId !== req.user.userId &&
        req.user.role !== 'ADMINISTRADOR'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para acessar esta avaliação'
        });
      }
    }

    // Verificar se tem permissão de avaliador
    if (!req.user.isAvaliador && req.user.role !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas avaliadores.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar acesso à avaliação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões'
    });
  }
};

/**
 * Helper para verificar se o usuário atual tem dual role
 */
export const checkDualRole = async (userId: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        evaluatorApplications: {
          where: { status: 'APROVADA' },
          take: 1
        }
      }
    });

    if (!user) return false;

    return (
      user.role === 'ORIENTADOR' &&
      user.evaluatorApplications.length > 0
    );
  } catch (error) {
    console.error('Erro ao verificar dual role:', error);
    return false;
  }
};

/**
 * Endpoint helper para obter informações de dual role do usuário
 */
export const getUserRoleInfo = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        evaluatorApplications: {
          where: { status: 'APROVADA' },
          take: 1
        }
      }
    });

    if (!user) return null;

    const hasApprovedEvaluatorApplication = user.evaluatorApplications.length > 0;
    const roles: string[] = [user.role];
    
    if (user.role === 'ORIENTADOR' && hasApprovedEvaluatorApplication) {
      roles.push('AVALIADOR');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      primaryRole: user.role,
      roles: roles,
      isDualRole: roles.length > 1,
      isOrientador: user.role === 'ORIENTADOR',
      isAvaliador: user.role === 'AVALIADOR' || hasApprovedEvaluatorApplication
    };
  } catch (error) {
    console.error('Erro ao obter informações de role:', error);
    return null;
  }
};