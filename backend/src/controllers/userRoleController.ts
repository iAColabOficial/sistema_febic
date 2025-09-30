// backend/src/controllers/userRoleController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/dualRoleAuth';

const prisma = new PrismaClient();

/**
 * GET /api/users/me/role-info
 * Retorna informações completas sobre o role do usuário atual
 */
export const getMyRoleInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        evaluatorApplications: {
          where: { status: 'APROVADA' },
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        ownedProjects: {
          select: {
            id: true,
            status: true
          }
        },
        avaliacoes: {
          select: {
            id: true,
            isCompleted: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const hasApprovedEvaluatorApplication = user.evaluatorApplications.length > 0;
    const roles: string[] = [user.role];
    
    if (user.role === 'ORIENTADOR' && hasApprovedEvaluatorApplication) {
      roles.push('AVALIADOR');
    }

    const roleInfo = {
      userId: user.id,
      email: user.email,
      name: user.name,
      primaryRole: user.role,
      roles: roles,
      isDualRole: roles.length > 1,
      isOrientador: user.role === 'ORIENTADOR',
      isAvaliador: user.role === 'AVALIADOR' || hasApprovedEvaluatorApplication,
      stats: {
        ownedProjects: user.ownedProjects.length,
        evaluations: user.avaliacoes.length,
        completedEvaluations: user.avaliacoes.filter(e => e.isCompleted).length,
        pendingEvaluations: user.avaliacoes.filter(e => !e.isCompleted).length
      },
      evaluatorApplication: user.evaluatorApplications[0] || null
    };

    return res.status(200).json({
      success: true,
      data: roleInfo
    });
  } catch (error) {
    console.error('Erro ao obter informações de role:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter informações de role'
    });
  }
};

/**
 * GET /api/users/:userId/role-info (Admin only)
 * Retorna informações de role de um usuário específico
 */
export const getUserRoleInfoById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        evaluatorApplications: {
          where: { status: 'APROVADA' },
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        ownedProjects: {
          select: {
            id: true,
            status: true
          }
        },
        avaliacoes: {
          select: {
            id: true,
            isCompleted: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const hasApprovedEvaluatorApplication = user.evaluatorApplications.length > 0;
    const roles: string[] = [user.role];
    
    if (user.role === 'ORIENTADOR' && hasApprovedEvaluatorApplication) {
      roles.push('AVALIADOR');
    }

    const roleInfo = {
      userId: user.id,
      email: user.email,
      name: user.name,
      primaryRole: user.role,
      roles: roles,
      isDualRole: roles.length > 1,
      isOrientador: user.role === 'ORIENTADOR',
      isAvaliador: user.role === 'AVALIADOR' || hasApprovedEvaluatorApplication,
      stats: {
        ownedProjects: user.ownedProjects.length,
        evaluations: user.avaliacoes.length,
        completedEvaluations: user.avaliacoes.filter(e => e.isCompleted).length,
        pendingEvaluations: user.avaliacoes.filter(e => !e.isCompleted).length
      },
      evaluatorApplication: user.evaluatorApplications[0] || null
    };

    return res.status(200).json({
      success: true,
      data: roleInfo
    });
  } catch (error) {
    console.error('Erro ao obter informações de role do usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter informações de role'
    });
  }
};

/**
 * GET /api/users/dual-role-users
 * Lista todos os usuários com dual role (Admin only)
 */
export const getDualRoleUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'ORIENTADOR',
        evaluatorApplications: {
          some: {
            status: 'APROVADA'
          }
        }
      },
      include: {
        evaluatorApplications: {
          where: { status: 'APROVADA' },
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        ownedProjects: {
          select: {
            id: true,
            status: true
          }
        },
        avaliacoes: {
          select: {
            id: true,
            isCompleted: true
          }
        }
      }
    });

    const dualRoleUsers = users.map(user => ({
      userId: user.id,
      email: user.email,
      name: user.name,
      primaryRole: user.role,
      roles: [user.role, 'AVALIADOR'],
      isDualRole: true,
      stats: {
        ownedProjects: user.ownedProjects.length,
        evaluations: user.avaliacoes.length,
        completedEvaluations: user.avaliacoes.filter(e => e.isCompleted).length,
        pendingEvaluations: user.avaliacoes.filter(e => !e.isCompleted).length
      },
      evaluatorApplicationApprovedAt: user.evaluatorApplications[0]?.createdAt || null
    }));

    return res.status(200).json({
      success: true,
      data: {
        total: dualRoleUsers.length,
        users: dualRoleUsers
      }
    });
  } catch (error) {
    console.error('Erro ao obter usuários com dual role:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter usuários com dual role'
    });
  }
};