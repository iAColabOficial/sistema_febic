import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Interface para dados de registro
interface RegisterData {
  // Dados básicos (Step 1)
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  password: string;
  role?: UserRole;
  
  // Dados pessoais (Step 2)
  birthDate?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Dados acadêmicos (Step 3)
  institution?: string;
  position?: string;
  formation?: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        passwordHash: true,
        phone: true,
        birthDate: true,
        gender: true,
        nationality: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        institution: true,
        position: true,
        formation: true,
        role: true,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Verificar se usuário existe e está ativo
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    // Atualizar dados de login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        loginCount: user.loginCount + 1
      }
    });
    
    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Remover password do retorno
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    // Pegar TODOS os campos do body que o frontend envia
    const { 
      // Step 1 - Dados básicos
      email, 
      cpf, 
      name, 
      phone, 
      password, 
      role,
      
      // Step 2 - Dados pessoais  
      birthDate,
      gender,
      nationality,
      address,
      neighborhood, 
      city,
      state,
      zipCode,
      country,
      
      // Step 3 - Dados acadêmicos
      institution,
      position,
      formation
    } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email }, 
          ...(cpf ? [{ cpf }] : [])
        ] 
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email ou CPF já cadastrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Converter birthDate se fornecido
    const parsedBirthDate = birthDate ? new Date(birthDate) : null;

    const user = await prisma.user.create({
      data: {
        // Dados básicos
        email,
        cpf,
        name,
        phone,
        passwordHash: hashedPassword,
        role: role || 'AUTOR',
        
        // Dados pessoais - AGORA INCLUÍDOS
        birthDate: parsedBirthDate,
        gender,
        nationality: nationality || 'Brasileiro',
        address,
        neighborhood,
        city,
        state,
        zipCode,
        country: country || 'Brasil',
        
        // Dados acadêmicos - AGORA INCLUÍDOS
        institution,
        position,
        formation
      },
      select: {
        id: true,
        email: true,
        cpf: true,
        name: true,
        phone: true,
        birthDate: true,
        gender: true,
        nationality: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        institution: true,
        position: true,
        formation: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: { user, token }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar usuário com todos os dados
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        birthDate: true,
        gender: true,
        nationality: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        institution: true,
        position: true,
        formation: true,
        role: true,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const {
      name,
      phone,
      birthDate,
      gender,
      nationality,
      address,
      neighborhood,
      city,
      state,
      zipCode,
      country,
      institution,
      position,
      formation
    } = req.body;

    // Validações básicas
    if (name && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome não pode estar vazio'
      });
    }

    let parsedBirthDate: Date | undefined = undefined;
    if (birthDate) {
      parsedBirthDate = new Date(birthDate);
      if (isNaN(parsedBirthDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento inválida'
        });
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(parsedBirthDate && { birthDate: parsedBirthDate }),
        ...(gender !== undefined && { gender: gender?.trim() || null }),
        ...(nationality !== undefined && { nationality: nationality?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(neighborhood !== undefined && { neighborhood: neighborhood?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(state !== undefined && { state: state?.trim() || null }),
        ...(zipCode !== undefined && { zipCode: zipCode ? zipCode.replace(/\D/g, '') : null }),
        ...(country !== undefined && { country: country?.trim() || null }),
        ...(institution !== undefined && { institution: institution?.trim() || null }),
        ...(position !== undefined && { position: position?.trim() || null }),
        ...(formation !== undefined && { formation: formation?.trim() || null })
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        birthDate: true,
        gender: true,
        nationality: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        institution: true,
        position: true,
        formation: true,
        role: true,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { passwordHash: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await prisma.user.update({
      where: { id: String(userId) },
      data: { passwordHash: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Função auxiliar para logout (apenas para logs)
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // Como usamos JWT stateless, não precisamos invalidar o token no servidor
    // Apenas registramos o logout para auditoria se necessário
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
// Adicionar esta função ao final do seu authController.ts existente:

export const searchUserByCPF = async (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    
    // Validar CPF básico
    if (!cpf) {
      return res.status(400).json({
        success: false,
        message: 'CPF é obrigatório'
      });
    }

    // Limpar CPF (remover pontos e traços)
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'CPF deve ter 11 dígitos'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { cpf: cleanCPF },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        birthDate: true,
        gender: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        institution: true,
        position: true,
        formation: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erro ao buscar usuário por CPF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};