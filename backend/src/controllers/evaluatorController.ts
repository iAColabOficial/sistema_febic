// backend/src/controllers/evaluatorController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Aplicar para ser avaliador
export const applyForEvaluator = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const { motivation, experience, expertise, categories, areasOfKnowledge } = req.body;

    // Validações
    if (!motivation || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Motivação e experiência são obrigatórias'
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selecione pelo menos uma categoria'
      });
    }

    if (!areasOfKnowledge || areasOfKnowledge.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selecione pelo menos uma área de conhecimento'
      });
    }

    // Verificar se já existe candidatura pendente
    const existingApplication = await prisma.evaluatorApplication.findFirst({
      where: {
        userId,
        status: 'PENDENTE'
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui uma candidatura pendente de análise'
      });
    }

    // Verificar se o usuário já é avaliador
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.role === 'AVALIADOR') {
      return res.status(400).json({
        success: false,
        message: 'Você já é um avaliador do sistema'
      });
    }

    // Criar candidatura
    const application = await prisma.evaluatorApplication.create({
      data: {
        userId,
        motivation,
        experience,
        expertise,
        categories,
        areasOfKnowledge,
        status: 'PENDENTE'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            institution: true,
            formation: true
          }
        }
      }
    });

    // Log de confirmação (substitui email por enquanto)
    console.log(`Nova candidatura de avaliador: ${user?.name} (${user?.email})`);

    res.json({
      success: true,
      message: 'Candidatura enviada com sucesso! Você receberá uma resposta em até 5 dias úteis.',
      data: application
    });

  } catch (error) {
    console.error('Erro ao aplicar para avaliador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar candidaturas (apenas admin)
export const getEvaluatorApplications = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (user?.role !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const { status = 'all', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.evaluatorApplication.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              institution: true,
              formation: true,
              city: true,
              state: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.evaluatorApplication.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Aprovar/reprovar candidatura (apenas admin)
export const evaluateApplication = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (user?.role !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const { id } = req.params;
    const { decision, adminNotes } = req.body;

    if (!['APROVADA', 'REPROVADA'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decisão deve ser APROVADA ou REPROVADA'
      });
    }

    const application = await prisma.evaluatorApplication.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidatura não encontrada'
      });
    }

    if (application.status !== 'PENDENTE') {
      return res.status(400).json({
        success: false,
        message: 'Esta candidatura já foi avaliada'
      });
    }

    // Atualizar candidatura
    const updatedApplication = await prisma.$transaction(async (tx) => {
      // Atualizar status da candidatura
      const updated = await tx.evaluatorApplication.update({
        where: { id },
        data: {
          status: decision,
          adminNotes,
          evaluatedAt: new Date(),
          evaluatedBy: user.id
        }
      });

      // Se aprovada, alterar role do usuário para AVALIADOR
      if (decision === 'APROVADA') {
        await tx.user.update({
          where: { id: application.userId },
          data: {
            role: 'AVALIADOR'
          }
        });
      }

      return updated;
    });

    // Log de confirmação (substitui email por enquanto)
    console.log(`Candidatura ${decision.toLowerCase()}: ${application.user.name} (${application.user.email})`);

    res.json({
      success: true,
      message: `Candidatura ${decision.toLowerCase()} com sucesso!`,
      data: updatedApplication
    });

  } catch (error) {
    console.error('Erro ao avaliar candidatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar status da candidatura do usuário atual
export const getMyApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const application = await prisma.evaluatorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Erro ao buscar status da candidatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};