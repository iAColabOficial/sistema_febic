import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware para verificar se o usuário é gestor de uma feira afiliada ativa
 */
export const feiraAfiliadaAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Autenticação necessária'
      });
    }

    // Verifica se o usuário é gestor de alguma feira ativa
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        managerId: userId,
        isActive: true
      }
    });

    if (!feira) {
      return res.status(403).json({
        message: 'Você não é gestor de nenhuma feira afiliada ativa'
      });
    }

    // Adiciona a feira ao request para uso posterior
    req.feiraAfiliada = feira;

    next();
  } catch (error) {
    console.error('Erro no middleware feiraAfiliadaAuth:', error);
    return res.status(500).json({
      message: 'Erro ao verificar permissões de feira afiliada'
    });
  }
};

/**
 * Middleware para verificar se o usuário tem acesso a uma feira específica
 */
export const validarAcessoFeira = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { feiraId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: 'Autenticação necessária'
      });
    }

    if (!feiraId) {
      return res.status(400).json({
        message: 'ID da feira não fornecido'
      });
    }

    // Admins têm acesso a todas as feiras
    if (req.user?.role === 'ADMINISTRADOR') {
      next();
      return;
    }

    // Verifica se o usuário é gestor desta feira específica
    const feira = await prisma.feiraAfiliada.findFirst({
      where: {
        id: feiraId,
        managerId: userId,
        isActive: true
      }
    });

    if (!feira) {
      return res.status(403).json({
        message: 'Você não tem permissão para acessar esta feira'
      });
    }

    // Adiciona a feira ao request
    req.feiraAfiliada = feira;

    next();
  } catch (error) {
    console.error('Erro no middleware validarAcessoFeira:', error);
    return res.status(500).json({
      message: 'Erro ao validar acesso à feira'
    });
  }
};

// Adicionar tipo ao AuthRequest
declare module './auth' {
  interface AuthRequest {
    feiraAfiliada?: any;
  }
}