// backend/src/services/evaluationService.ts
import { PrismaClient, Category, User, Project } from '@prisma/client';

const prisma = new PrismaClient();

interface EvaluatorConflict {
  evaluatorId: string;
  reason: string;
}

interface DistributionResult {
  success: boolean;
  assigned: string[];
  conflicts: EvaluatorConflict[];
  message: string;
}

export class EvaluationService {
  
  /**
   * Distribui automaticamente avaliadores para um projeto
   */
  static async distributeEvaluators(projectId: string): Promise<DistributionResult> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          orientadores: {
            include: { user: true }
          },
          areaConhecimento: true
        }
      });

      if (!project) {
        return {
          success: false,
          assigned: [],
          conflicts: [],
          message: 'Projeto não encontrado'
        };
      }

      // Buscar avaliadores elegíveis
      const eligibleEvaluators = await this.getEligibleEvaluators(project);
      
      if (eligibleEvaluators.length < 3) {
        return {
          success: false,
          assigned: [],
          conflicts: [],
          message: `Apenas ${eligibleEvaluators.length} avaliadores elegíveis encontrados. Necessário intervenção manual.`
        };
      }

      // Sortear 3 avaliadores
      const selectedEvaluators = this.shuffleArray(eligibleEvaluators).slice(0, 3);

      // Criar avaliações
      const assignments = await Promise.all(
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

      return {
        success: true,
        assigned: selectedEvaluators.map(e => e.id),
        conflicts: [],
        message: `3 avaliadores atribuídos com sucesso`
      };

    } catch (error) {
      console.error('Erro na distribuição:', error);
      return {
        success: false,
        assigned: [],
        conflicts: [],
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Busca avaliadores elegíveis para um projeto
   */
  private static async getEligibleEvaluators(project: any): Promise<User[]> {
    const orientadorInstitutions = project.orientadores.map((o: any) => o.institution);
    const projectCategory = project.category;

    // Buscar todos os avaliadores
    const allEvaluators = await prisma.user.findMany({
      where: {
        role: 'AVALIADOR',
        isActive: true
      }
    });

    // Filtrar conflitos
    const eligibleEvaluators = [];

    for (const evaluator of allEvaluators) {
      const conflicts = await this.checkConflicts(evaluator, project, orientadorInstitutions);
      
      if (conflicts.length === 0) {
        eligibleEvaluators.push(evaluator);
      }
    }

    return eligibleEvaluators;
  }

  /**
   * Verifica conflitos de interesse para um avaliador
   */
  private static async checkConflicts(
    evaluator: User, 
    project: any, 
    orientadorInstitutions: string[]
  ): Promise<string[]> {
    const conflicts: string[] = [];

    // 1. Conflito: Mesma instituição
    if (orientadorInstitutions.includes(evaluator.institution || '')) {
      conflicts.push('Mesma instituição do orientador');
    }

    // 2. Conflito: Orientador na mesma categoria
    const isOrientadorInCategory = await prisma.projectOrientador.findFirst({
      where: {
        userId: evaluator.id,
        project: {
          category: project.category
        }
      }
    });

    if (isOrientadorInCategory) {
      conflicts.push(`Orientador na categoria ${project.category}`);
    }

    // 3. Conflito: Já possui avaliação para este projeto
    const existingEvaluation = await prisma.projectAvaliacao.findFirst({
      where: {
        projectId: project.id,
        avaliadorId: evaluator.id
      }
    });

    if (existingEvaluation) {
      conflicts.push('Já atribuído a este projeto');
    }

    // 4. Conflito: Muitos projetos atribuídos (limite de 10)
    const assignedCount = await prisma.projectAvaliacao.count({
      where: {
        avaliadorId: evaluator.id,
        isCompleted: false
      }
    });

    if (assignedCount >= 10) {
      conflicts.push('Limite de projetos atingido');
    }

    return conflicts;
  }

  /**
   * Distribui avaliadores para todos os projetos classificados
   */
  static async distributeAllProjects(): Promise<{
    success: number;
    failed: number;
    details: any[];
  }> {
    const classifiedProjects = await prisma.project.findMany({
      where: {
        status: {
          in: ['FINALISTA_PRESENCIAL', 'CONFIRMADO_VIRTUAL']
        }
      }
    });

    const results = {
      success: 0,
      failed: 0,
      details: [] as any[]
    };

    for (const project of classifiedProjects) {
      const distribution = await this.distributeEvaluators(project.id);
      
      if (distribution.success) {
        results.success++;
      } else {
        results.failed++;
      }

      results.details.push({
        projectId: project.id,
        projectTitle: project.title,
        ...distribution
      });
    }

    return results;
  }

  /**
   * Calcula nota final baseada nos critérios da FEBIC
   */
  static calculateFinalGrade(
    category: Category,
    notaInovacao?: number,
    notaMetodologia?: number,
    notaRelevancia?: number,
    notaApresentacao?: number,
    notaImpacto?: number,
    notaViabilidade?: number
  ): number {
    // Critérios baseados no regulamento FEBIC
    const criteria = this.getEvaluationCriteria(category);
    
    let finalGrade = 0;
    let totalWeight = 0;

    if (notaInovacao !== undefined) {
      finalGrade += notaInovacao * criteria.inovacao;
      totalWeight += criteria.inovacao;
    }

    if (notaMetodologia !== undefined) {
      finalGrade += notaMetodologia * criteria.metodologia;
      totalWeight += criteria.metodologia;
    }

    if (notaRelevancia !== undefined) {
      finalGrade += notaRelevancia * criteria.relevancia;
      totalWeight += criteria.relevancia;
    }

    if (notaApresentacao !== undefined) {
      finalGrade += notaApresentacao * criteria.apresentacao;
      totalWeight += criteria.apresentacao;
    }

    if (notaImpacto !== undefined) {
      finalGrade += notaImpacto * criteria.impacto;
      totalWeight += criteria.impacto;
    }

    if (notaViabilidade !== undefined) {
      finalGrade += notaViabilidade * criteria.viabilidade;
      totalWeight += criteria.viabilidade;
    }

    return totalWeight > 0 ? finalGrade / totalWeight : 0;
  }

  /**
   * Retorna critérios de avaliação por categoria
   */
  private static getEvaluationCriteria(category: Category) {
    // Categorias I e II - Infantil e Fundamental (1º ao 6º ano)
    if (category === 'I' || category === 'II') {
      return {
        inovacao: 0.15,      // Originalidade 15%
        metodologia: 0.30,   // Método Científico 30%
        relevancia: 0.15,    // Capacidade argumentativa 15%
        apresentacao: 0.10,  // Adequação das referências 10%
        impacto: 0.20,       // Objetivo pedagógico 20%
        viabilidade: 0.10    // Outros 10%
      };
    }

    // Categorias III a VIII - Fundamental (7º ao 9º), Médio, Superior, Pós
    return {
      inovacao: 0.15,      // Originalidade 15%
      metodologia: 0.35,   // Evidência método científico 35%
      relevancia: 0.15,    // Capacidade argumentativa 15%
      apresentacao: 0.25,  // Clareza na dissertação 25%
      impacto: 0.05,       // Impacto social/ambiental 5%
      viabilidade: 0.05    // Adequação das referências 5%
    };
  }

  /**
   * Embaralha array para sorteio aleatório
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Adiciona avaliador manualmente (override do admin)
   */
  static async assignEvaluatorManually(
    projectId: string, 
    evaluatorId: string, 
    adminId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se o admin tem permissão
      const admin = await prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || admin.role !== 'ADMINISTRADOR') {
        return {
          success: false,
          message: 'Sem permissão para esta ação'
        };
      }

      // Verificar se já existe avaliação
      const existing = await prisma.projectAvaliacao.findFirst({
        where: {
          projectId,
          avaliadorId: evaluatorId
        }
      });

      if (existing) {
        return {
          success: false,
          message: 'Avaliador já atribuído a este projeto'
        };
      }

      // Criar avaliação
      await prisma.projectAvaliacao.create({
        data: {
          projectId,
          avaliadorId: evaluatorId,
          pesoTotal: 1.00
        }
      });

      return {
        success: true,
        message: 'Avaliador atribuído com sucesso'
      };

    } catch (error) {
      console.error('Erro ao atribuir avaliador:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Remove avaliador de um projeto
   */
  static async removeEvaluator(
    projectId: string, 
    evaluatorId: string, 
    adminId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const admin = await prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || admin.role !== 'ADMINISTRADOR') {
        return {
          success: false,
          message: 'Sem permissão para esta ação'
        };
      }

      const evaluation = await prisma.projectAvaliacao.findFirst({
        where: {
          projectId,
          avaliadorId: evaluatorId
        }
      });

      if (!evaluation) {
        return {
          success: false,
          message: 'Avaliação não encontrada'
        };
      }

      if (evaluation.isCompleted) {
        return {
          success: false,
          message: 'Não é possível remover avaliação já finalizada'
        };
      }

      await prisma.projectAvaliacao.delete({
        where: { id: evaluation.id }
      });

      return {
        success: true,
        message: 'Avaliador removido com sucesso'
      };

    } catch (error) {
      console.error('Erro ao remover avaliador:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }
}