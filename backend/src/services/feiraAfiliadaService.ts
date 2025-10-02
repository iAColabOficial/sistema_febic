import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class FeiraAfiliadaService {
  /**
   * Gera um token único de credenciamento
   */
  static async gerarTokenUnico(): Promise<string> {
    let token: string;
    let exists = true;

    while (exists) {
      token = crypto.randomBytes(16).toString('hex');
      const feira = await prisma.feiraAfiliada.findUnique({
        where: { credencialToken: token }
      });
      exists = !!feira;
    }

    return token!;
  }

  /**
   * Valida se uma feira pode credenciar mais projetos
   */
  static async validarLimiteCredenciamento(feiraId: string): Promise<{
    podeCredenciar: boolean;
    motivo?: string;
    vagasRestantes: number;
  }> {
    const feira = await prisma.feiraAfiliada.findUnique({
      where: { id: feiraId },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    });

    if (!feira) {
      return {
        podeCredenciar: false,
        motivo: 'Feira não encontrada',
        vagasRestantes: 0
      };
    }

    if (!feira.isActive) {
      return {
        podeCredenciar: false,
        motivo: 'Feira não está ativa',
        vagasRestantes: 0
      };
    }

    const vagasRestantes = feira.maxProjects - feira._count.projects;

    if (vagasRestantes <= 0) {
      return {
        podeCredenciar: false,
        motivo: `Limite de ${feira.maxProjects} projetos atingido`,
        vagasRestantes: 0
      };
    }

    return {
      podeCredenciar: true,
      vagasRestantes
    };
  }

  /**
   * Verifica se um projeto já está credenciado
   */
  static async verificarProjetoCredenciado(projectId: string): Promise<{
    credenciado: boolean;
    feira?: any;
  }> {
    const projeto = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        feiraAfiliada: true
      }
    });

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    return {
      credenciado: !!projeto.feiraAfiliadaId,
      feira: projeto.feiraAfiliada
    };
  }

  /**
   * Busca feiras ativas disponíveis para credenciamento
   */
  static async buscarFeirasDisponiveisParaCredenciamento() {
    const hoje = new Date();

    return await prisma.feiraAfiliada.findMany({
      where: {
        isActive: true,
        endDate: {
          gte: hoje // Apenas feiras que ainda não terminaram
        }
      },
      include: {
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  /**
   * Credencia um projeto para uma feira
   */
  static async credenciarProjeto(feiraId: string, projectId: string, userId: string) {
    // Valida limites
    const validacao = await this.validarLimiteCredenciamento(feiraId);
    if (!validacao.podeCredenciar) {
      throw new Error(validacao.motivo);
    }

    // Verifica se já está credenciado
    const { credenciado, feira } = await this.verificarProjetoCredenciado(projectId);
    if (credenciado) {
      throw new Error(`Projeto já credenciado por: ${feira?.name}`);
    }

    // Verifica permissão do usuário
    const feiraData = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: userId,
        isActive: true
      }
    });

    if (!feiraData) {
      throw new Error('Você não tem permissão para credenciar projetos por esta feira');
    }

    // Credencia o projeto
    return await prisma.project.update({
      where: { id: projectId },
      data: {
        feiraAfiliadaId: feiraId,
        status: 'APROVADO_CIAS' // Pula a avaliação CIAS
      },
      include: {
        feiraAfiliada: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        areaConhecimento: true
      }
    });
  }

  /**
   * Remove credencial de um projeto
   */
  static async removerCredencial(feiraId: string, projectId: string, userId: string) {
    // Verifica permissão
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: userId,
        isActive: true
      }
    });

    if (!feira) {
      throw new Error('Você não tem permissão para remover credenciais desta feira');
    }

    // Verifica se o projeto pertence a esta feira
    const projeto = await prisma.project.findFirst({
      where: {
        id: projectId,
        feiraAfiliadaId: feiraId
      }
    });

    if (!projeto) {
      throw new Error('Projeto não encontrado ou não pertence a esta feira');
    }

    // Remove credencial
    return await prisma.project.update({
      where: { id: projectId },
      data: {
        feiraAfiliadaId: null,
        status: 'RASCUNHO'
      }
    });
  }

  /**
   * Busca estatísticas de uma feira
   */
  static async obterEstatisticasFeira(feiraId: string, userId: string) {
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: userId,
        isActive: true
      },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    });

    if (!feira) {
      throw new Error('Feira não encontrada ou você não tem permissão');
    }

    // Estatísticas por categoria
    const porCategoria = await prisma.project.groupBy({
      by: ['category'],
      where: { feiraAfiliadaId: feiraId },
      _count: true
    });

    // Estatísticas por status
    const porStatus = await prisma.project.groupBy({
      by: ['status'],
      where: { feiraAfiliadaId: feiraId },
      _count: true
    });

    // Projetos por área de conhecimento
    const porArea = await prisma.project.groupBy({
      by: ['areaConhecimentoId'],
      where: { feiraAfiliadaId: feiraId },
      _count: true
    });

    return {
      feira,
      totalCredenciados: feira._count.projects,
      vagasDisponiveis: feira.maxProjects - feira._count.projects,
      porCategoria,
      porStatus,
      porArea
    };
  }

  /**
   * Valida se um usuário é gestor de uma feira
   */
  static async validarGestorFeira(feiraId: string, userId: string): Promise<boolean> {
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: userId,
        isActive: true
      }
    });

    return !!feira;
  }
}