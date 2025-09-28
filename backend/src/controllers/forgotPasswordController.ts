// backend/src/controllers/forgotPasswordController.ts - VERSÃO SIMPLIFICADA
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// import nodemailer from 'nodemailer'; // Para enviar emails (comentado para não quebrar)

const prisma = new PrismaClient();

// Armazenar tokens em memória (em produção, usar Redis ou banco)
const resetTokens = new Map<string, { userId: string, expires: Date }>();

// Passo 1: Solicitar reset de senha (apenas email)
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Sempre retornar sucesso para não expor se o email existe
    if (!user) {
      return res.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para resetar a senha'
      });
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Armazenar token
    resetTokens.set(token, {
      userId: user.id,
      expires
    });

    // Em produção, enviar email aqui
    console.log(`Link de reset para ${user.email}:`);
    console.log(`https://febic.ibicsc.com.br/auth/reset-password/${token}`);

    res.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá um link para resetar a senha',
      // Em desenvolvimento, retornar o token
      ...(process.env.NODE_ENV === 'development' && { token })
    });

  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Passo 2: Verificar se o token é válido
export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const tokenData = resetTokens.get(token);
    
    if (!tokenData || tokenData.expires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Token válido',
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Passo 3: Resetar senha com o token
export const resetPasswordWithToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha é obrigatória'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    const tokenData = resetTokens.get(token);
    
    if (!tokenData || tokenData.expires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Gerar hash da nova senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha no banco
    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { 
        passwordHash,
        updatedAt: new Date()
      }
    });

    // Remover token usado
    resetTokens.delete(token);

    console.log(`Senha resetada para usuário ID: ${tokenData.userId}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Limpar tokens expirados (executar periodicamente)
setInterval(() => {
  const now = new Date();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expires < now) {
      resetTokens.delete(token);
    }
  }
}, 5 * 60 * 1000); // A cada 5 minutos