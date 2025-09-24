import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Interface para dados de registro
interface RegisterData {
  // Dados bÃ¡sicos (Step 1)
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
  
  // Dados acadÃªmicos (Step 3)
  institution?: string;
  position?: string;
  formation?: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ValidaÃ§Ãµes bÃ¡sicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha sÃ£o obrigatÃ³rios'
      });
    }

    // Buscar usuÃ¡rio por email
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

    // Verificar se usuÃ¡rio existe e estÃ¡ ativo
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha invÃ¡lidos'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha invÃ¡lidos'
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
      // Step 1 - Dados bÃ¡sicos
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
      
      // Step 3 - Dados acadÃªmicos
      institution,
      position,
      formation
    } = req.body;

    // Verificar se usuÃ¡rio jÃ¡ existe
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
        message: 'Email ou CPF jÃ¡ cadastrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Converter birthDate se fornecido
    const parsedBirthDate = birthDate ? new Date(birthDate) : null;

    const user = await prisma.user.create({
      data: {
        // Dados bÃ¡sicos
        email,
        cpf,
        name,
        phone,
        passwordHash: hashedPassword,
        role: role || 'AUTOR',
        
        // Dados pessoais - AGORA INCLUÃDOS
        birthDate: parsedBirthDate,
        gender,
        nationality: nationality || 'Brasileiro',
        address,
        neighborhood,
        city,
        state,
        zipCode,
        country: country || 'Brasil',
        
        // Dados acadÃªmicos - AGORA INCLUÃDOS
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
      message: 'UsuÃ¡rio criado com sucesso',
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
        message: 'UsuÃ¡rio nÃ£o autenticado'
      });
    }

    // Buscar usuÃ¡rio com todos os dados
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
        message: 'UsuÃ¡rio nÃ£o encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'UsuÃ¡rio inativo'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Erro ao buscar usuÃ¡rio:', error);
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
        message: 'UsuÃ¡rio nÃ£o autenticado'
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

    // ValidaÃ§Ãµes bÃ¡sicas
    if (name && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome nÃ£o pode estar vazio'
      });
    }

    let parsedBirthDate: Date | undefined = undefined;
    if (birthDate) {
      parsedBirthDate = new Date(birthDate);
      if (isNaN(parsedBirthDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento invÃ¡lida'
        });
      }
    }

    // Atualizar usuÃ¡rio
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
        message: 'UsuÃ¡rio nÃ£o autenticado'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha sÃ£o obrigatÃ³rias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Buscar usuÃ¡rio atual
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { passwordHash: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'UsuÃ¡rio nÃ£o encontrado'
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

// FunÃ§Ã£o auxiliar para logout (apenas para logs)
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // Como usamos JWT stateless, nÃ£o precisamos invalidar o token no servidor
    // Apenas registramos o logout para auditoria se necessÃ¡rio
    
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
// Adicionar esta funÃ§Ã£o ao final do seu authController.ts existente:

export const searchUserByCPF = async (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    
    // Validar CPF bÃ¡sico
    if (!cpf) {
      return res.status(400).json({
        success: false,
        message: 'CPF Ã© obrigatÃ³rio'
      });
    }

    // Limpar CPF (remover pontos e traÃ§os)
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'CPF deve ter 11 dÃ­gitos'
      });
    }

    // Buscar usuÃ¡rio
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
        message: 'UsuÃ¡rio nÃ£o encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erro ao buscar usuÃ¡rio por CPF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};