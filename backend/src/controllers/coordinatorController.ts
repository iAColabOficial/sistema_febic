// backend/src/controllers/coordinatorController.ts
import { Request, Response } from 'express';
import { PrismaClient, ProjectStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Dashboard com estatísticas
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalProjects,
      projectsSubmitted,
      projectsInReview,
      totalEvaluators,
      activeEvaluators,
      pendingEvaluations,
      completedEvaluations,
      projectsByCategory
    ] = await Promise.all([
      // Total de projetos
      prisma.project.count(),
      
      // Projetos submetidos (aguardando distribuição)
      prisma.project.count({
        where: { status: ProjectStatus.SUBMETIDO }
      }),
      
      // Projetos em análise
      prisma.project.count({
        where: { status: ProjectStatus.EM_ANALISE_CIAS }
      }),
      
      // Total de avaliadores
      prisma.user.count({
        where: { role: UserRole.AVALIADOR }
      }),
      
      // Avaliadores com avaliações ativas
      prisma.user.count({
        where: {
          role: UserRole.AVALIADOR,
          avaliacoes: {
            some: {
              isCompleted: false
            }
          }
        }
      }),
      
      // Avaliações pendentes
      prisma.projectAvaliacao.count({
        where: { isCompleted: false }
      }),
      
      // Avaliações concluídas
      prisma.projectAvaliacao.count({
        where: { isCompleted: true }
      }),
      
      // Projetos por categoria
      prisma.project.groupBy({
        by: ['category'],
        _count: true
      })
    ]);

    res.json({
      totalProjects,
      projectsSubmitted,
      projectsInReview,
      totalEvaluators,
      activeEvaluators,
      pendingEvaluations,
      completedEvaluations,
      projectsByCategory: projectsByCategory.map(item => ({
        category: item.category,
        count: item._count
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
  }
};

// Listar projetos aguardando distribuição
export const getProjectsForDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const { category, areaConhecimento, search, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: ProjectStatus.SUBMETIDO
    };

    if (category) {
      where.category = category;
    }

    if (areaConhecimento) {
      where.areaConhecimentoId = areaConhecimento;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { keywords: { hasSome: [search as string] } }
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          areaConhecimento: {
            select: {
              sigla: true,
              nome: true
            }
          },
          avaliacoes: {
            select: {
              id: true,
              avaliadorId: true,
              isCompleted: true
            }
          },
          _count: {
            select: {
              avaliacoes: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { submissionDate: 'asc' }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar projetos para distribuição:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos para distribuição' });
  }
};

// Listar avaliadores disponíveis
export const getAvailableEvaluators = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.query;

    const evaluators = await prisma.user.findMany({
      where: {
        role: UserRole.AVALIADOR,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        formation: true,
        _count: {
          select: {
            avaliacoes: {
              where: {
                isCompleted: false
              }
            }
          }
        },
        avaliacoes: {
          where: {
            projectId: projectId as string
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Formatar resposta
    const formattedEvaluators = evaluators.map(evaluator => ({
      id: evaluator.id,
      name: evaluator.name,
      email: evaluator.email,
      formation: evaluator.formation,
      activeEvaluations: evaluator._count.avaliacoes,
      alreadyAssigned: evaluator.avaliacoes.length > 0
    }));

    res.json(formattedEvaluators);
  } catch (error) {
    console.error('Erro ao buscar avaliadores:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliadores disponíveis' });
  }
};

// Distribuir manualmente um projeto para avaliadores
export const distributeProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, evaluatorIds } = req.body;

    if (!projectId || !Array.isArray(evaluatorIds) || evaluatorIds.length === 0) {
      return res.status(400).json({ 
        error: 'Project ID e lista de avaliadores são obrigatórios' 
      });
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        avaliacoes: true
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar avaliadores já atribuídos
    const existingEvaluatorIds = project.avaliacoes.map(av => av.avaliadorId);
    const newEvaluatorIds = evaluatorIds.filter(id => !existingEvaluatorIds.includes(id));

    if (newEvaluatorIds.length === 0) {
      return res.status(400).json({ 
        error: 'Todos os avaliadores selecionados já foram atribuídos a este projeto' 
      });
    }

    // Criar avaliações
    const avaliacoes = await prisma.$transaction(
      newEvaluatorIds.map(avaliadorId =>
        prisma.projectAvaliacao.create({
          data: {
            projectId,
            avaliadorId,
            pesoTotal: 1.00
          }
        })
      )
    );

    // Atualizar status do projeto se necessário
    if (project.status === ProjectStatus.SUBMETIDO) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.EM_ANALISE_CIAS }
      });
    }

    res.json({
      message: `${avaliacoes.length} avaliador(es) atribuído(s) com sucesso`,
      avaliacoes
    });
  } catch (error) {
    console.error('Erro ao distribuir projeto:', error);
    res.status(500).json({ error: 'Erro ao distribuir projeto para avaliadores' });
  }
};

// Remover avaliador de um projeto
export const removeEvaluator = async (req: AuthRequest, res: Response) => {
  try {
    const { avaliacaoId } = req.params;

    // Verificar se a avaliação existe e se já foi iniciada
    const avaliacao = await prisma.projectAvaliacao.findUnique({
      where: { id: avaliacaoId }
    });

    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }

    if (avaliacao.isCompleted) {
      return res.status(400).json({ 
        error: 'Não é possível remover um avaliador de uma avaliação já concluída' 
      });
    }

    // Se a avaliação já foi iniciada (tem notas), avisar
    if (avaliacao.notaFinal !== null) {
      return res.status(400).json({ 
        error: 'Esta avaliação já foi iniciada. Não é possível removê-la.' 
      });
    }

    await prisma.projectAvaliacao.delete({
      where: { id: avaliacaoId }
    });

    res.json({ message: 'Avaliador removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover avaliador:', error);
    res.status(500).json({ error: 'Erro ao remover avaliador do projeto' });
  }
};

// Distribuição automática de projetos
export const autoDistributeProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { evaluatorsPerProject = 2 } = req.body;

    // Buscar projetos pendentes
    const projects = await prisma.project.findMany({
      where: { status: ProjectStatus.SUBMETIDO },
      include: {
        avaliacoes: true
      }
    });

    if (projects.length === 0) {
      return res.status(400).json({ 
        error: 'Não há projetos pendentes para distribuir' 
      });
    }

    // Buscar avaliadores ativos
    const evaluators = await prisma.user.findMany({
      where: {
        role: UserRole.AVALIADOR,
        isActive: true
      },
      include: {
        avaliacoes: {
          where: {
            isCompleted: false
          }
        }
      }
    });

    if (evaluators.length < evaluatorsPerProject) {
      return res.status(400).json({ 
        error: `Não há avaliadores suficientes. Necessário pelo menos ${evaluatorsPerProject} avaliadores.` 
      });
    }

    const distributions: any[] = [];

    // Distribuir projetos
    for (const project of projects) {
      const currentEvaluatorIds = project.avaliacoes.map(av => av.avaliadorId);
      const neededEvaluators = evaluatorsPerProject - currentEvaluatorIds.length;

      if (neededEvaluators <= 0) continue;

      // Ordenar avaliadores por carga de trabalho
      const sortedEvaluators = evaluators
        .filter(ev => !currentEvaluatorIds.includes(ev.id))
        .sort((a, b) => a.avaliacoes.length - b.avaliacoes.length);

      // Selecionar avaliadores com menor carga
      const selectedEvaluators = sortedEvaluators.slice(0, neededEvaluators);

      // Criar avaliações
      const newAvaliacoes = await prisma.$transaction(
        selectedEvaluators.map(evaluator =>
          prisma.projectAvaliacao.create({
            data: {
              projectId: project.id,
              avaliadorId: evaluator.id,
              pesoTotal: 1.00
            }
          })
        )
      );

      // Atualizar contador local
      selectedEvaluators.forEach(ev => {
        ev.avaliacoes.push(newAvaliacoes[0] as any);
      });

      // Atualizar status do projeto
      await prisma.project.update({
        where: { id: project.id },
        data: { status: ProjectStatus.EM_ANALISE_CIAS }
      });

      distributions.push({
        projectId: project.id,
        projectTitle: project.title,
        evaluatorsAssigned: selectedEvaluators.map(ev => ({
          id: ev.id,
          name: ev.name
        }))
      });
    }

    res.json({
      message: `${distributions.length} projetos distribuídos automaticamente`,
      distributions
    });
  } catch (error) {
    console.error('Erro na distribuição automática:', error);
    res.status(500).json({ error: 'Erro ao realizar distribuição automática' });
  }
};

// Visualizar avaliações de um projeto
export const getProjectEvaluations = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const avaliacoes = await prisma.projectAvaliacao.findMany({
      where: { projectId },
      include: {
        avaliador: {
          select: {
            id: true,
            name: true,
            email: true,
            formation: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar avaliações do projeto:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações do projeto' });
  }
};

// Relatório de distribuição
export const getDistributionReport = async (req: AuthRequest, res: Response) => {
  try {
    const evaluatorsReport = await prisma.user.findMany({
      where: {
        role: UserRole.AVALIADOR,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            avaliacoes: true
          }
        },
        avaliacoes: {
          where: {
            isCompleted: false
          },
          select: {
            id: true,
            project: {
              select: {
                id: true,
                title: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedReport = evaluatorsReport.map(evaluator => ({
      id: evaluator.id,
      name: evaluator.name,
      email: evaluator.email,
      totalEvaluations: evaluator._count.avaliacoes,
      pendingEvaluations: evaluator.avaliacoes.length,
      activeProjects: evaluator.avaliacoes.map(av => ({
        id: av.project.id,
        title: av.project.title,
        category: av.project.category
      }))
    }));

    res.json(formattedReport);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de distribuição' });
  }
};