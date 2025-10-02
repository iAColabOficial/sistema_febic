// backend/src/controllers/feiraAfiliadaController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// SOLICITAÇÃO DE AFILIAÇÃO (público ou feira_afiliada role)
export const solicitarAfiliacao = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      city,
      state,
      edition,
      year,
      startDate,
      endDate,
      maxProjects,
      contactName,
      contactEmail,
      contactPhone,
      managerId,
    } = req.body;

    // Validações
    if (!name || !city || !state || !edition || !year || !startDate || !endDate || !contactName || !contactEmail) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios: nome, cidade, estado, edição, ano, datas, contato' 
      });
    }

    // Verifica se já existe solicitação pendente
    const existente = await prisma.feiraAfiliada.findFirst({
      where: {
        name,
        year,
        edition,
        isActive: false, // pendente
      }
    });

    if (existente) {
      return res.status(400).json({ 
        message: 'Já existe uma solicitação pendente para esta feira' 
      });
    }

    // Gera token de credenciamento (será ativado após aprovação)
    const credencialToken = crypto.randomBytes(16).toString('hex');

    const feira = await prisma.feiraAfiliada.create({
      data: {
        name,
        city,
        state,
        edition,
        year: parseInt(year),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxProjects: maxProjects ? parseInt(maxProjects) : 50,
        contactName,
        contactEmail,
        contactPhone,
        managerId: managerId || req.user?.id, // Se tiver usuário logado
        credencialToken,
        isActive: false, // Pendente de aprovação
      },
    });

    res.status(201).json({
      message: 'Solicitação de afiliação enviada com sucesso! Aguarde aprovação.',
      feira,
    });
  } catch (error: any) {
    console.error('Erro ao solicitar afiliação:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação', error: error.message });
  }
};

// ADMIN: Listar solicitações pendentes
export const listarSolicitacoesPendentes = async (req: Request, res: Response) => {
  try {
    const solicitacoes = await prisma.feiraAfiliada.findMany({
      where: { isActive: false },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(solicitacoes);
  } catch (error: any) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ message: 'Erro ao buscar solicitações', error: error.message });
  }
};

// ADMIN: Aprovar feira afiliada
export const aprovarFeira = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { maxProjects } = req.body;

    const feira = await prisma.feiraAfiliada.update({
      where: { id },
      data: {
        isActive: true,
        maxProjects: maxProjects ? parseInt(maxProjects) : undefined,
      },
    });

    // TODO: Enviar email de aprovação com o token de credenciamento

    res.json({
      message: 'Feira afiliada aprovada com sucesso!',
      feira,
    });
  } catch (error: any) {
    console.error('Erro ao aprovar feira:', error);
    res.status(500).json({ message: 'Erro ao aprovar feira', error: error.message });
  }
};

// ADMIN: Rejeitar feira afiliada
export const rejeitarFeira = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    // Podemos deletar ou marcar como rejeitada
    await prisma.feiraAfiliada.delete({
      where: { id },
    });

    // TODO: Enviar email informando rejeição com motivo

    res.json({
      message: 'Solicitação rejeitada',
    });
  } catch (error: any) {
    console.error('Erro ao rejeitar feira:', error);
    res.status(500).json({ message: 'Erro ao rejeitar feira', error: error.message });
  }
};

// ADMIN: Listar todas as feiras ativas
export const listarFeirasAtivas = async (req: Request, res: Response) => {
  try {
    const feiras = await prisma.feiraAfiliada.findMany({
      where: { isActive: true },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { startDate: 'desc' },
    });

    res.json(feiras);
  } catch (error: any) {
    console.error('Erro ao listar feiras ativas:', error);
    res.status(500).json({ message: 'Erro ao buscar feiras', error: error.message });
  }
};

// FEIRA AFILIADA: Buscar projetos elegíveis para credenciamento
export const buscarProjetosElegiveis = async (req: AuthRequest, res: Response) => {
  try {
    const { feiraId } = req.params;
    const { search } = req.query;

    // Verifica se o usuário é manager da feira
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: req.user?.id,
        isActive: true,
      },
    });

    if (!feira) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Busca projetos que ainda não foram credenciados
    const where: any = {
      feiraAfiliadaId: null,
      status: {
        in: ['RASCUNHO', 'SUBMETIDO'],
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { institution: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const projetos = await prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        areaConhecimento: true,
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    res.json(projetos);
  } catch (error: any) {
    console.error('Erro ao buscar projetos elegíveis:', error);
    res.status(500).json({ message: 'Erro ao buscar projetos', error: error.message });
  }
};

// FEIRA AFILIADA: Credenciar projeto
export const credenciarProjeto = async (req: AuthRequest, res: Response) => {
  try {
    const { feiraId, projectId } = req.params;

    // Verifica se o usuário é manager da feira
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: req.user?.id,
        isActive: true,
      },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    });

    if (!feira) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verifica limite de projetos
    if (feira._count.projects >= feira.maxProjects) {
      return res.status(400).json({ 
        message: `Limite de ${feira.maxProjects} projetos credenciados atingido` 
      });
    }

    // Verifica se projeto já foi credenciado
    const projeto = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    if (projeto.feiraAfiliadaId) {
      return res.status(400).json({ message: 'Projeto já foi credenciado por outra feira' });
    }

    // Credencia o projeto
    const projetoAtualizado = await prisma.project.update({
      where: { id: projectId },
      data: {
        feiraAfiliadaId: feiraId,
        status: 'APROVADO_CIAS', // Aprovado direto para Etapa Virtual
      },
      include: {
        feiraAfiliada: true,
        owner: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    // TODO: Enviar email para o autor informando credenciamento

    res.json({
      message: 'Projeto credenciado com sucesso!',
      projeto: projetoAtualizado,
    });
  } catch (error: any) {
    console.error('Erro ao credenciar projeto:', error);
    res.status(500).json({ message: 'Erro ao credenciar projeto', error: error.message });
  }
};

// FEIRA AFILIADA: Listar projetos credenciados
export const listarProjetosCredenciados = async (req: AuthRequest, res: Response) => {
  try {
    const { feiraId } = req.params;

    // Verifica se o usuário é manager da feira
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: req.user?.id,
        isActive: true,
      },
    });

    if (!feira) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const projetos = await prisma.project.findMany({
      where: { feiraAfiliadaId: feiraId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        areaConhecimento: true,
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projetos);
  } catch (error: any) {
    console.error('Erro ao listar projetos credenciados:', error);
    res.status(500).json({ message: 'Erro ao buscar projetos', error: error.message });
  }
};

// FEIRA AFILIADA: Remover credencial de projeto
export const removerCredencial = async (req: AuthRequest, res: Response) => {
  try {
    const { feiraId, projectId } = req.params;

    // Verifica se o usuário é manager da feira
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: req.user?.id,
        isActive: true,
      },
    });

    if (!feira) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verifica se o projeto pertence a esta feira
    const projeto = await prisma.project.findFirst({
      where: {
        id: projectId,
        feiraAfiliadaId: feiraId,
      },
    });

    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Remove credencial
    const projetoAtualizado = await prisma.project.update({
      where: { id: projectId },
      data: {
        feiraAfiliadaId: null,
        status: 'RASCUNHO',
      },
    });

    res.json({
      message: 'Credencial removida com sucesso',
      projeto: projetoAtualizado,
    });
  } catch (error: any) {
    console.error('Erro ao remover credencial:', error);
    res.status(500).json({ message: 'Erro ao remover credencial', error: error.message });
  }
};

// FEIRA AFILIADA: Dashboard com estatísticas
export const dashboardFeira = async (req: AuthRequest, res: Response) => {
  try {
    const { feiraId } = req.params;

    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: req.user?.id,
        isActive: true,
      },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    });

    if (!feira) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Estatísticas por categoria
    const porCategoria = await prisma.project.groupBy({
      by: ['category'],
      where: { feiraAfiliadaId: feiraId },
      _count: true,
    });

    // Estatísticas por status
    const porStatus = await prisma.project.groupBy({
      by: ['status'],
      where: { feiraAfiliadaId: feiraId },
      _count: true,
    });

    res.json({
      feira,
      totalCredenciados: feira._count.projects,
      vagasDisponiveis: feira.maxProjects - feira._count.projects,
      porCategoria,
      porStatus,
    });
  } catch (error: any) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
};

// PÚBLICO: Buscar feiras ativas (para dropdown na submissão)
export const buscarFeirasPublicas = async (req: Request, res: Response) => {
  try {
    const feiras = await prisma.feiraAfiliada.findMany({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(), // Apenas feiras que ainda não terminaram
        }
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        edition: true,
        year: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: 'desc' },
    });

    res.json(feiras);
  } catch (error: any) {
    console.error('Erro ao buscar feiras públicas:', error);
    res.status(500).json({ message: 'Erro ao buscar feiras', error: error.message });
  }
};