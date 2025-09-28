// backend/src/middleware/evaluatorAuth.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * Middleware específico para validações de avaliador
 */
export const evaluatorAuthMiddleware = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se é avaliador ou admin
    if (user.role !== 'AVALIADOR' && user.role !== 'ADMINISTRADOR') {
      return res.status(403).json({ 
        message: 'Acesso negado. Apenas avaliadores podem acessar esta funcionalidade.',
        userRole: user.role 
      });
    }

    // Se é avaliador, verificar se está ativo
    if (user.role === 'AVALIADOR' && !user.isActive) {
      return res.status(403).json({ 
        message: 'Conta de avaliador desativada. Entre em contato com a administração.' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de avaliador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar se o avaliador pode acessar uma avaliação específica
 */
export const evaluationOwnershipMiddleware = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = req.user;
    const evaluationId = req.params.id;

    if (!user || !evaluationId) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }

    // Admin pode acessar qualquer avaliação
    if (user.role === 'ADMINISTRADOR') {
      return next();
    }

    // Verificar se a avaliação pertence ao avaliador
    const evaluation = await prisma.projectAvaliacao.findFirst({
      where: {
        id: evaluationId,
        avaliadorId: user.id
      }
    });

    if (!evaluation) {
      return res.status(404).json({ 
        message: 'Avaliação não encontrada ou você não tem permissão para acessá-la' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de propriedade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar se uma avaliação pode ser editada
 */
export const evaluationEditableMiddleware = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const evaluationId = req.params.id;

    if (!evaluationId) {
      return res.status(400).json({ message: 'ID da avaliação não fornecido' });
    }

    const evaluation = await prisma.projectAvaliacao.findUnique({
      where: { id: evaluationId }
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    if (evaluation.isCompleted) {
      return res.status(400).json({ 
        message: 'Esta avaliação já foi finalizada e não pode ser modificada',
        completedAt: evaluation.completedAt
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de edição:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar conflitos antes de atribuir avaliação
 */
export const conflictCheckMiddleware = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { projectId, evaluatorId } = req.body;

    if (!projectId || !evaluatorId) {
      return res.status(400).json({ message: 'ProjectId e EvaluatorId são obrigatórios' });
    }

    // Buscar dados do projeto e avaliador
    const [project, evaluator] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          orientadores: true
        }
      }),
      prisma.user.findUnique({
        where: { id: evaluatorId }
      })
    ]);

    if (!project || !evaluator) {
      return res.status(404).json({ message: 'Projeto ou avaliador não encontrado' });
    }

    const conflicts = [];

    // 1. Verificar mesma instituição
    const orientadorInstitutions = project.orientadores.map(o => o.institution);
    if (orientadorInstitutions.includes(evaluator.institution || '')) {
      conflicts.push('Avaliador da mesma instituição do orientador');
    }

    // 2. Verificar se é orientador na mesma categoria
    const isOrientadorInCategory = await prisma.projectOrientador.findFirst({
      where: {
        userId: evaluator.id,
        project: {
          category: project.category
        }
      }
    });

    if (isOrientadorInCategory) {
      conflicts.push(`Avaliador é orientador na categoria ${project.category}`);
    }

    // 3. Verificar se já está atribuído
    const existingEvaluation = await prisma.projectAvaliacao.findFirst({
      where: {
        projectId,
        avaliadorId: evaluatorId
      }
    });

    if (existingEvaluation) {
      conflicts.push('Avaliador já atribuído a este projeto');
    }

    // 4. Verificar limite de projetos
    const assignedCount = await prisma.projectAvaliacao.count({
      where: {
        avaliadorId: evaluatorId,
        isCompleted: false
      }
    });

    if (assignedCount >= 10) {
      conflicts.push('Avaliador atingiu o limite máximo de projetos (10)');
    }

    if (conflicts.length > 0) {
      return res.status(400).json({ 
        message: 'Conflitos de interesse detectados',
        conflicts,
        canAssign: false
      });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação de conflitos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para log de ações de avaliação
 */
export const evaluationAuditMiddleware = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const evaluationId = req.params.id;
      const projectId = req.body?.projectId || req.params.projectId;

      // Log da ação
      console.log(`[EVALUATION_AUDIT] ${action}`, {
        userId: user?.id,
        userRole: user?.role,
        evaluationId,
        projectId,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Aqui você pode implementar um sistema de auditoria mais robusto
      // salvando no banco de dados, enviando para logs centralizados, etc.

      next();
    } catch (error) {
      console.error('Erro no middleware de auditoria:', error);
      next(); // Não bloquear a requisição por erro de log
    }
  };
};