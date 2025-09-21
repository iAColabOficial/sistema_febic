// backend/src/controllers/evaluationController.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

interface EvaluationCriteria {
  notaInovacao: number;
  notaMetodologia: number;
  notaRelevancia: number;
  notaApresentacao: number;
  notaImpacto: number;
  notaViabilidade?: number; // Opcional - nem todas categorias têm
}

const prisma = new PrismaClient();


// Critérios de avaliação por categoria
const EVALUATION_CRITERIA = {
  I: { // Educação Infantil
    notaInovacao: 0.15,      // 15%
    notaMetodologia: 0.20,   // 20%
    notaRelevancia: 0.20,    // 20%
    notaApresentacao: 0.25,  // 25%
    notaImpacto: 0.20        // 20%
  },
  II: { // Fundamental 1º-3º
    notaInovacao: 0.20,
    notaMetodologia: 0.25,
    notaRelevancia: 0.20,
    notaApresentacao: 0.20,
    notaImpacto: 0.15
  },
  III: { // Fundamental 4º-5º
    notaInovacao: 0.20,
    notaMetodologia: 0.25,
    notaRelevancia: 0.20,
    notaApresentacao: 0.20,
    notaImpacto: 0.15
  },
  IV: { // Fundamental 6º-9º
    notaInovacao: 0.22,
    notaMetodologia: 0.23,
    notaRelevancia: 0.20,
    notaApresentacao: 0.20,
    notaImpacto: 0.15
  },
  V: { // Ensino Médio
    notaInovacao: 0.25,
    notaMetodologia: 0.20,
    notaRelevancia: 0.15,
    notaApresentacao: 0.15,
    notaImpacto: 0.15,
    notaViabilidade: 0.10
  },
  VI: { // Ensino Médio Técnico
    notaInovacao: 0.25,
    notaMetodologia: 0.20,
    notaRelevancia: 0.15,
    notaApresentacao: 0.15,
    notaImpacto: 0.15,
    notaViabilidade: 0.10
  },
  VII: { // Ensino Superior
    notaInovacao: 0.25,
    notaMetodologia: 0.20,
    notaRelevancia: 0.15,
    notaApresentacao: 0.10,
    notaImpacto: 0.15,
    notaViabilidade: 0.15
  },
  VIII: { // Pós-graduação
    notaInovacao: 0.30,
    notaMetodologia: 0.25,
    notaRelevancia: 0.15,
    notaApresentacao: 0.10,
    notaImpacto: 0.10,
    notaViabilidade: 0.10
  },
  IX: { // Especialização/Mestrado/Doutorado
    notaInovacao: 0.30,
    notaMetodologia: 0.25,
    notaRelevancia: 0.15,
    notaApresentacao: 0.10,
    notaImpacto: 0.10,
    notaViabilidade: 0.10
  },
  RELATO: { // Relato de Experiência
    notaInovacao: 0.15,
    notaMetodologia: 0.20,
    notaRelevancia: 0.25,
    notaApresentacao: 0.25,
    notaImpacto: 0.15
  }
};

export const createEvaluation = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const {
      notaInovacao,
      notaMetodologia,
      notaRelevancia,
      notaApresentacao,
      notaImpacto,
      notaViabilidade,
      comentarioGeral,
      pontosFortes,
      pontosMelhoria,
      sugestoes
    } = req.body;

    const avaliadorId = req.user?.userId;

    // Verificar se é avaliador
    if (req.user?.role !== 'AVALIADOR' && req.user?.role !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        message: 'Apenas avaliadores podem criar avaliações'
      });
    }

    // Buscar projeto e verificar se existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        category: true, 
        status: true,
        title: true 
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se projeto está em status avaliável
    const avaliatableStatuses = [
      'EM_ANALISE_CIAS',
      'CONFIRMADO_VIRTUAL',
      'FINALISTA_PRESENCIAL'
    ];

    if (!avaliatableStatuses.includes(project.status)) {
      return res.status(400).json({
        success: false,
        message: 'Projeto não está em status avaliável'
      });
    }

    // Verificar se já existe avaliação deste avaliador para este projeto
    const existingEvaluation = await prisma.projectAvaliacao.findUnique({
      where: {
        projectId_avaliadorId: {
          projectId,
          avaliadorId: avaliadorId!
        }
      }
    });

    if (existingEvaluation) {
      return res.status(409).json({
        success: false,
        message: 'Você já avaliou este projeto'
      });
    }

    // Validar notas (0-10)
    const notas = [notaInovacao, notaMetodologia, notaRelevancia, notaApresentacao, notaImpacto, notaViabilidade];
    for (const nota of notas) {
      if (nota !== undefined && (nota < 0 || nota > 10)) {
        return res.status(400).json({
          success: false,
          message: 'Todas as notas devem estar entre 0 e 10'
        });
      }
    }

    // Calcular nota final baseada nos critérios da categoria
    const criteria = EVALUATION_CRITERIA[project.category] || EVALUATION_CRITERIA.VI;
    let notaFinal = 0;
    let pesoTotal = 0;

    if (notaInovacao !== undefined) {
      notaFinal += notaInovacao * criteria.notaInovacao;
      pesoTotal += criteria.notaInovacao;
    }
    if (notaMetodologia !== undefined) {
      notaFinal += notaMetodologia * criteria.notaMetodologia;
      pesoTotal += criteria.notaMetodologia;
    }
    if (notaRelevancia !== undefined) {
      notaFinal += notaRelevancia * criteria.notaRelevancia;
      pesoTotal += criteria.notaRelevancia;
    }
    if (notaApresentacao !== undefined) {
      notaFinal += notaApresentacao * criteria.notaApresentacao;
      pesoTotal += criteria.notaApresentacao;
    }
    if (notaImpacto !== undefined) {
      notaFinal += notaImpacto * criteria.notaImpacto;
      pesoTotal += criteria.notaImpacto;
    }
    if (notaViabilidade !== undefined && 'notaViabilidade' in criteria && criteria.notaViabilidade) {
      notaFinal += notaViabilidade * criteria.notaViabilidade;
      pesoTotal += criteria.notaViabilidade;
    }

    // Criar avaliação
    const evaluation = await prisma.projectAvaliacao.create({
      data: {
        projectId,
        avaliadorId: avaliadorId!,
        notaInovacao,
        notaMetodologia,
        notaRelevancia,
        notaApresentacao,
        notaImpacto,
        notaViabilidade,
        notaFinal: pesoTotal > 0 ? notaFinal : null,
        pesoTotal,
        comentarioGeral,
        pontosFortes,
        pontosMelhoria,
        sugestoes,
        isCompleted: true,
        completedAt: new Date()
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        avaliador: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: evaluation
    });

  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getProjectEvaluations = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Verificar permissões
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        ownerId: true, 
        title: true,
        status: true 
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Permissões:
    // - Admin: vê todas
    // - Dono do projeto: vê todas (só comentários públicos)
    // - Avaliador: vê apenas suas próprias
    let whereClause: any = { projectId };

    if (userRole === 'ADMINISTRADOR') {
      // Admin vê tudo
    } else if (project.ownerId === userId) {
      // Dono do projeto - adicionar filtros se necessário
    } else if (userRole === 'AVALIADOR') {
      // Avaliador vê apenas suas próprias
      whereClause.avaliadorId = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para ver avaliações deste projeto'
      });
    }

    const evaluations = await prisma.projectAvaliacao.findMany({
      where: whereClause,
      include: {
        avaliador: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    res.json({
      success: true,
      data: evaluations
    });

  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getMyEvaluations = async (req: AuthRequest, res: Response) => {
  try {
    const avaliadorId = req.user?.userId;

    if (req.user?.role !== 'AVALIADOR' && req.user?.role !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        message: 'Apenas avaliadores podem acessar esta rota'
      });
    }

    const evaluations = await prisma.projectAvaliacao.findMany({
      where: { avaliadorId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            institution: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    res.json({
      success: true,
      data: evaluations
    });

  } catch (error) {
    console.error('Erro ao buscar minhas avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getProjectsToEvaluate = async (req: AuthRequest, res: Response) => {
  try {
    const avaliadorId = req.user?.userId;

    if (req.user?.role !== 'AVALIADOR' && req.user?.role !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        message: 'Apenas avaliadores podem acessar esta rota'
      });
    }

    // Buscar projetos que estão em status avaliável e ainda não foram avaliados por este avaliador
    const projects = await prisma.project.findMany({
      where: {
        status: {
          in: ['EM_ANALISE_CIAS', 'CONFIRMADO_VIRTUAL', 'FINALISTA_PRESENCIAL']
        },
        // Projetos que NÃO foram avaliados por este avaliador
        avaliacoes: {
          none: {
            avaliadorId
          }
        }
      },
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
        _count: {
          select: {
            members: true,
            orientadores: true,
            avaliacoes: true
          }
        }
      },
      orderBy: { submissionDate: 'asc' }
    });

    res.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Erro ao buscar projetos para avaliar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};