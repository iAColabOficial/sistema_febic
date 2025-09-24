import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminController {
  
  // Listar usuários com paginação e filtros
  static async getUsers(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        role, 
        search 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = {};
      
      if (role && role !== 'all') {
        where.role = role;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      // Buscar usuários com contagem de projetos
      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          include: {
            _count: {
              select: { ownedProjects: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / take);

      // Mapear dados para formato esperado pelo frontend
      const usersFormatted = users.map(user => ({
        ...user,
        _count: {
          projects: user._count.ownedProjects // Mapear para o nome esperado pelo frontend
        }
      }));

      res.json({
        success: true,
        data: usersFormatted,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Estatísticas gerais do sistema
  static async getStats(req: Request, res: Response) {
    try {
      // Estatísticas de usuários
      const [
        totalUsers,
        usersByRole,
        totalProjects,
        projectsByStatus,
        projectsByCategory,
        topAreas
      ] = await Promise.all([
        // Total de usuários
        prisma.user.count(),
        
        // Usuários por role
        prisma.user.groupBy({
          by: ['role'],
          _count: true
        }),
        
        // Total de projetos
        prisma.project.count(),
        
        // Projetos por status
        prisma.project.groupBy({
          by: ['status'],
          _count: true
        }),
        
        // Projetos por categoria
        prisma.project.groupBy({
          by: ['category'],
          _count: true
        }),
        
        // Top áreas de conhecimento
        prisma.project.groupBy({
          by: ['areaConhecimentoId'],
          _count: true,
          orderBy: {
            _count: { areaConhecimentoId: 'desc' }
          },
          take: 10
        })
      ]);

      // Buscar informações das áreas
      const topAreasWithDetails = await Promise.all(
        topAreas.map(async (area) => {
          const areaDetails = await prisma.areaConhecimento.findUnique({
            where: { id: area.areaConhecimentoId },
            select: { nome: true, sigla: true }
          });
          return {
            areaConhecimentoId: area.areaConhecimentoId,
            _count: area._count,
            area: areaDetails
          };
        })
      );

      // Formatar dados para o frontend
      const usersByRoleFormatted = usersByRole.reduce((acc, curr) => {
        acc[curr.role] = curr._count;
        return acc;
      }, {} as Record<string, number>);

      const projectsByStatusFormatted = projectsByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>);

      const projectsByCategoryFormatted = projectsByCategory.reduce((acc, curr) => {
        acc[curr.category || 'SEM_CATEGORIA'] = curr._count;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            byRole: usersByRoleFormatted,
            byMonth: [] // Implementar depois se necessário
          },
          projects: {
            total: totalProjects,
            byStatus: projectsByStatusFormatted,
            byCategory: projectsByCategoryFormatted,
            byMonth: [], // Implementar depois se necessário
            topAreas: topAreasWithDetails
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Criar novo usuário (admin)
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role, cpf, phone, city, state, institution } = req.body;

      // Verificar se já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: role || 'AUTOR',
          cpf,
          phone,
          city,
          state,
          institution
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          city: true,
          state: true,
          institution: true,
          phone: true
        }
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário criado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar usuário
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remover campos que não devem ser atualizados diretamente
      delete updateData.id;
      delete updateData.passwordHash;
      delete updateData.createdAt;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          city: true,
          state: true,
          institution: true,
          phone: true,
          _count: {
            select: { ownedProjects: true }
          }
        }
      });

      res.json({
        success: true,
        data: user,
        message: 'Usuário atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar usuário
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar se usuário tem projetos
      const projectCount = await prisma.project.count({
        where: { ownerId: id }
      });

      if (projectCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Não é possível deletar usuário com ${projectCount} projeto(s) associado(s)`
        });
      }

      await prisma.user.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Dashboard de atividades recentes (dados reais do banco)
  static async getRecentActivities(req: Request, res: Response) {
    try {
      const [recentUsers, recentProjects] = await Promise.all([
        // Últimos 5 usuários cadastrados no sistema
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        }),
        
        // Últimos 5 projetos criados no sistema
        prisma.project.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: {
              select: { name: true }
            },
            areaConhecimento: {
              select: { nome: true, sigla: true }
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          recentUsers,      // Usuários reais cadastrados recentemente
          recentProjects    // Projetos reais criados recentemente
        }
      });

    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}