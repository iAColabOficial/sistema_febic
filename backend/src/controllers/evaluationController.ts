// backend/src/controllers/evaluationController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { EvaluationService } from '../services/evaluationService';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Schemas de validação
const evaluationSchema = z.object({
  projectId: z.string(),
  notaInovacao: z.number().min(0).max(10).optional(),
  notaMetodologia: z.number().min(0).max(10).optional(),
  notaRelevancia: z.number().min(0).max(10).optional(),
  notaApresentacao: z.number().min(0).max(10).optional(),
  notaImpacto: z.number().min(0).max(10).optional(),
  notaViabilidade: z.number().min(0).max(10).optional(),
  comentarioGeral: z.string().optional(),
  pontosFortes: z.string().optional(),
  pontosMelhoria: z.string().optional(),
  sugestoes: z.string().optional(),
});

const assignEvaluatorSchema = z.object({
  projectId: z.string(),
  evaluatorId: z.string(),
});

export class EvaluationController {

  /**
   * Lista projetos atribuídos ao avaliador logado
   */
  static async getMyEvaluations(req: AuthRequest, res: Response) {
    try {
      const evaluatorId = req.user?.id;

      if (!evaluatorId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const evaluations = await prisma.projectAvaliacao.findMany({
        where: {
          avaliadorId: evaluatorId
        },
        include: {
          project: {
            include: {
              owner: true,
              orientadores: true,
              areaConhecimento: true,
              members: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedEvaluations = evaluations.map(evaluation => ({
        id: evaluation.id,
        isCompleted: evaluation.isCompleted,
        completedAt: evaluation.completedAt,
        notaFinal: evaluation.notaFinal,
        project: {
          id: evaluation.project.id,
          title: evaluation.project.title,
          summary: evaluation.project.summary,
          category: evaluation.project.category,
          status: evaluation.project.status,
          areaConhecimento: evaluation.project.areaConhecimento,
          owner: {
            name: evaluation.project.owner.name,
            email: evaluation.project.owner.email
          },
          orientadores: evaluation.project.orientadores.map(o => ({
            name: o.name,
            email: o.email,
            institution: o.institution
          })),
          membersCount: evaluation.project.members.length
        }
      }));

      res.json(formattedEvaluations);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Busca detalhes de uma avaliação específica
   */
  static async getEvaluationDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const evaluatorId = req.user?.id;

      const evaluation = await prisma.projectAvaliacao.findFirst({
        where: {
          id,
          avaliadorId: evaluatorId
        },
        include: {
          project: {
            include: {
              owner: true,
              orientadores: true,
              areaConhecimento: true,
              members: true,
              documents: {
                where: { isApproved: true }
              }
            }
          }
        }
      });

      if (!evaluation) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }

      res.json(evaluation);
    } catch (error) {
      console.error('Erro ao buscar detalhes da avaliação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Salva ou atualiza uma avaliação
   */
  static async saveEvaluation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const evaluatorId = req.user?.id;
      const validatedData = evaluationSchema.parse(req.body);

      // Verificar se a avaliação pertence ao avaliador
      const evaluation = await prisma.projectAvaliacao.findFirst({
        where: {
          id,
          avaliadorId: evaluatorId
        },
        include: {
          project: true
        }
      });

      if (!evaluation) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }

      if (evaluation.isCompleted) {
        return res.status(400).json({ message: 'Avaliação já foi finalizada' });
      }

      // Calcular nota final
      const notaFinal = EvaluationService.calculateFinalGrade(
        evaluation.project.category,
        validatedData.notaInovacao,
        validatedData.notaMetodologia,
        validatedData.notaRelevancia,
        validatedData.notaApresentacao,
        validatedData.notaImpacto,
        validatedData.notaViabilidade
      );

      // Atualizar avaliação
      const updatedEvaluation = await prisma.projectAvaliacao.update({
        where: { id },
        data: {
          notaInovacao: validatedData.notaInovacao,
          notaMetodologia: validatedData.notaMetodologia,
          notaRelevancia: validatedData.notaRelevancia,
          notaApresentacao: validatedData.notaApresentacao,
          notaImpacto: validatedData.notaImpacto,
          notaViabilidade: validatedData.notaViabilidade,
          notaFinal,
          comentarioGeral: validatedData.comentarioGeral,
          pontosFortes: validatedData.pontosFortes,
          pontosMelhoria: validatedData.pontosMelhoria,
          sugestoes: validatedData.sugestoes,
          updatedAt: new Date()
        }
      });

      res.json({
        message: 'Avaliação salva com sucesso',
        evaluation: updatedEvaluation
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.issues });
      }
      console.error('Erro ao salvar avaliação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Finaliza uma avaliação
   */
  static async completeEvaluation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const evaluatorId = req.user?.id;

      const evaluation = await prisma.projectAvaliacao.findFirst({
        where: {
          id,
          avaliadorId: evaluatorId
        }
      });

      if (!evaluation) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }

      if (evaluation.isCompleted) {
        return res.status(400).json({ message: 'Avaliação já foi finalizada' });
      }

      // Verificar se todas as notas obrigatórias foram preenchidas
      if (!evaluation.notaInovacao || !evaluation.notaMetodologia || !evaluation.notaRelevancia) {
        return res.status(400).json({ 
          message: 'Preencha todas as notas obrigatórias antes de finalizar' 
        });
      }

      await prisma.projectAvaliacao.update({
        where: { id },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      });

      res.json({ message: 'Avaliação finalizada com sucesso' });
    } catch (error) {
      console.error('Erro ao finalizar avaliação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // === FUNÇÕES ADMINISTRATIVAS ===

  /**
   * Distribui avaliadores automaticamente para todos os projetos
   */
  static async distributeAllEvaluators(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const results = await EvaluationService.distributeAllProjects();
      
      res.json({
        message: 'Distribuição concluída',
        ...results
      });
    } catch (error) {
      console.error('Erro na distribuição automática:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Distribui avaliadores para um projeto específico
   */
  static async distributeProjectEvaluators(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { projectId } = req.params;
      const result = await EvaluationService.distributeEvaluators(projectId);
      
      res.json(result);
    } catch (error) {
      console.error('Erro na distribuição do projeto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Atribui avaliador manualmente a um projeto
   */
  static async assignEvaluator(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const validatedData = assignEvaluatorSchema.parse(req.body);
      const adminId = req.user.id;

      const result = await EvaluationService.assignEvaluatorManually(
        validatedData.projectId,
        validatedData.evaluatorId,
        adminId
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.issues });
      }
      console.error('Erro ao atribuir avaliador:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Remove avaliador de um projeto
   */
  static async removeEvaluator(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { projectId, evaluatorId } = req.params;
      const adminId = req.user.id;

      const result = await EvaluationService.removeEvaluator(projectId, evaluatorId, adminId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Erro ao remover avaliador:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Lista todas as distribuições de avaliação (admin)
   */
  static async getAllEvaluations(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const [evaluations, total] = await Promise.all([
        prisma.projectAvaliacao.findMany({
          skip,
          take: limit,
          include: {
            project: {
              select: {
                id: true,
                title: true,
                category: true,
                status: true
              }
            },
            avaliador: {
              select: {
                id: true,
                name: true,
                email: true,
                institution: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.projectAvaliacao.count()
      ]);

      res.json({
        evaluations,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Erro ao buscar avaliações (admin):', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Busca avaliadores disponíveis para um projeto
   */
  static async getAvailableEvaluators(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { projectId } = req.params;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          orientadores: true,
          areaConhecimento: true
        }
      });

      if (!project) {
        return res.status(404).json({ message: 'Projeto não encontrado' });
      }

      // Buscar todos os avaliadores
      const allEvaluators = await prisma.user.findMany({
        where: {
          role: 'AVALIADOR',
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          institution: true,
          formation: true
        }
      });

      // Verificar conflitos para cada avaliador
      const evaluatorsWithStatus = await Promise.all(
        allEvaluators.map(async (evaluator) => {
          const orientadorInstitutions = project.orientadores.map(o => o.institution);
          
          // Verificar conflitos
          const conflicts = [];

          // Mesma instituição
          if (orientadorInstitutions.includes(evaluator.institution || '')) {
            conflicts.push('Mesma instituição do orientador');
          }

          // Orientador na mesma categoria
          const isOrientadorInCategory = await prisma.projectOrientador.findFirst({
            where: {
              userId: evaluator.id,
              project: { category: project.category }
            }
          });

          if (isOrientadorInCategory) {
            conflicts.push(`Orientador na categoria ${project.category}`);
          }

          // Já atribuído
          const alreadyAssigned = await prisma.projectAvaliacao.findFirst({
            where: {
              projectId: project.id,
              avaliadorId: evaluator.id
            }
          });

          if (alreadyAssigned) {
            conflicts.push('Já atribuído a este projeto');
          }

          return {
            ...evaluator,
            conflicts,
            isEligible: conflicts.length === 0
          };
        })
      );

      res.json(evaluatorsWithStatus);
    } catch (error) {
      console.error('Erro ao buscar avaliadores disponíveis:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Estatísticas do sistema de avaliação
   */
  static async getEvaluationStats(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const [
        totalProjects,
        projectsWithEvaluators,
        completedEvaluations,
        pendingEvaluations,
        totalEvaluators
      ] = await Promise.all([
        prisma.project.count({
          where: {
            status: {
              in: ['FINALISTA_PRESENCIAL', 'CONFIRMADO_VIRTUAL']
            }
          }
        }),
        prisma.project.count({
          where: {
            status: {
              in: ['FINALISTA_PRESENCIAL', 'CONFIRMADO_VIRTUAL']
            },
            avaliacoes: {
              some: {}
            }
          }
        }),
        prisma.projectAvaliacao.count({
          where: { isCompleted: true }
        }),
        prisma.projectAvaliacao.count({
          where: { isCompleted: false }
        }),
        prisma.user.count({
          where: { 
            role: 'AVALIADOR',
            isActive: true 
          }
        })
      ]);

      const evaluationProgress = totalProjects > 0 
        ? Math.round((projectsWithEvaluators / totalProjects) * 100) 
        : 0;

      const completionRate = (completedEvaluations + pendingEvaluations) > 0
        ? Math.round((completedEvaluations / (completedEvaluations + pendingEvaluations)) * 100)
        : 0;

      res.json({
        totalProjects,
        projectsWithEvaluators,
        projectsWithoutEvaluators: totalProjects - projectsWithEvaluators,
        completedEvaluations,
        pendingEvaluations,
        totalEvaluators,
        evaluationProgress,
        completionRate
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}