import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class AdminController {
  
  // =================== GESTÃO DE USUÁRIOS ===================
  
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
          { email: { contains: search as string, mode: 'insensitive' } },
          { cpf: { contains: search as string, mode: 'insensitive' } }
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
              select: { 
                ownedProjects: true
              }
            },
            ownedProjects: {
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true
              },
              take: 3,
              orderBy: { createdAt: 'desc' }
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
          projects: user._count?.ownedProjects || 0,
          participations: 0 // Não temos esta relação no schema atual
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

  // Obter usuário específico por ID
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: { ownedProjects: true }
          },
          ownedProjects: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true
            }
          }
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
      console.error('Erro ao buscar usuário:', error);
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

      // Verificar CPF se fornecido
      if (cpf) {
        const existingCpf = await prisma.user.findUnique({
          where: { cpf }
        });

        if (existingCpf) {
          return res.status(400).json({
            success: false,
            message: 'CPF já cadastrado'
          });
        }
      }

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
          phone: true,
          cpf: true
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

      // Verificar email único se está sendo alterado
      if (updateData.email) {
        const existingUser = await prisma.user.findUnique({
          where: { 
            email: updateData.email,
            NOT: { id }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email já está em uso por outro usuário'
          });
        }
      }

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
          cpf: true,
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

      // Verificar se é membro de projetos (se a relação existir)
      try {
        const memberCount = await prisma.projectMember.count({
          where: { userId: id }
        });

        if (memberCount > 0) {
          // Remover das participações em projetos
          await prisma.projectMember.deleteMany({
            where: { userId: id }
          });
        }
      } catch (error) {
        // Se a relação ProjectMember não existir, continuar
        console.log('ProjectMember relation not found, skipping...');
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

  // Resetar senha do usuário (admin)
  static async resetUserPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Nova senha deve ter pelo menos 6 caracteres'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id },
        data: {
          passwordHash: hashedPassword
        }
      });

      res.json({
        success: true,
        message: 'Senha resetada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // =================== GESTÃO DE PROJETOS ===================

  // Listar todos os projetos (admin view)
  static async getAllProjects(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status,
        category,
        search 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};
      
      if (status && status !== 'all') {
        where.status = status;
      }
      
      if (category && category !== 'all') {
        where.category = category;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [projects, totalCount] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take,
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            },
            areaConhecimento: {
              select: { nome: true, sigla: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.project.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / take);

      res.json({
        success: true,
        data: projects,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });

    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter projeto específico por ID
  static async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          areaConhecimento: {
            select: { nome: true, sigla: true }
          },
          members: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          orientadores: true
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Projeto não encontrado'
        });
      }

      res.json({
        success: true,
        data: project
      });

    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar projeto (admin)
  static async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remover campos que não devem ser atualizados diretamente
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.owner;
      delete updateData.members;
      delete updateData.orientadores;

      const project = await prisma.project.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          owner: {
            select: { name: true, email: true }
          },
          areaConhecimento: {
            select: { nome: true, sigla: true }
          }
        }
      });

      res.json({
        success: true,
        data: project,
        message: 'Projeto atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar projeto (admin)
  static async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar se o projeto existe
      const project = await prisma.project.findUnique({
        where: { id }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Projeto não encontrado'
        });
      }

      // Deletar o projeto diretamente (cascade deve cuidar das relações)
      await prisma.project.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Projeto deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Alterar status do projeto em lote
  static async updateProjectsStatus(req: Request, res: Response) {
    try {
      const { projectIds, status } = req.body;

      if (!Array.isArray(projectIds) || !status) {
        return res.status(400).json({
          success: false,
          message: 'IDs dos projetos e status são obrigatórios'
        });
      }

      const updatedProjects = await prisma.project.updateMany({
        where: {
          id: { in: projectIds }
        },
        data: {
          status,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: updatedProjects,
        message: `${updatedProjects.count} projeto(s) atualizado(s) com sucesso`
      });

    } catch (error) {
      console.error('Erro ao atualizar status dos projetos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // =================== ESTATÍSTICAS E DASHBOARD ===================

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
        topAreas,
        recentActivity
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
        }),

        // Atividade dos últimos 30 dias
        prisma.project.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
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
            recentActivity
          },
          projects: {
            total: totalProjects,
            byStatus: projectsByStatusFormatted,
            byCategory: projectsByCategoryFormatted,
            topAreas: topAreasWithDetails,
            recentActivity
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

  // Atividades recentes detalhadas
  static async getDetailedActivities(req: Request, res: Response) {
    try {
      // Últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Buscar dados reais das atividades
      const [recentProjects, submittedProjects, recentUsers, approvedProjects] = await Promise.all([
        // Projetos criados
        prisma.project.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          include: { owner: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),

        // Projetos submetidos 
        prisma.project.findMany({
          where: { 
            submissionDate: { gte: thirtyDaysAgo },
            status: 'SUBMETIDO'
          },
          include: { owner: { select: { name: true } } },
          orderBy: { submissionDate: 'desc' },
          take: 10
        }),

        // Usuários cadastrados
        prisma.user.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { id: true, name: true, createdAt: true, role: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),

        // Projetos aprovados
        prisma.project.findMany({
          where: { 
            updatedAt: { gte: thirtyDaysAgo },
            status: 'APROVADO_CIAS'
          },
          include: { owner: { select: { name: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 5
        })
      ]);

      // Consolidar atividades
      const activities: any[] = [];

      // Projetos criados
      recentProjects.forEach(project => {
        activities.push({
          id: `project_created_${project.id}`,
          type: 'project_created',
          description: `Projeto "${project.title}" foi criado`,
          user: project.owner?.name || 'Usuário desconhecido',
          timestamp: project.createdAt.toISOString(),
          projectId: project.id
        });
      });

      // Projetos submetidos
      submittedProjects.forEach(project => {
        activities.push({
          id: `project_submitted_${project.id}`,
          type: 'project_submitted',
          description: `Projeto "${project.title}" foi submetido para avaliação`,
          user: project.owner?.name || 'Usuário desconhecido',
          timestamp: project.submissionDate?.toISOString() || project.updatedAt.toISOString(),
          projectId: project.id
        });
      });

      // Usuários registrados
      recentUsers.forEach(user => {
        activities.push({
          id: `user_registered_${user.id}`,
          type: 'user_registered',
          description: `Novo usuário ${user.role} cadastrado no sistema`,
          user: user.name,
          timestamp: user.createdAt.toISOString(),
          userId: user.id
        });
      });

      // Projetos aprovados
      approvedProjects.forEach(project => {
        activities.push({
          id: `project_approved_${project.id}`,
          type: 'project_approved',
          description: `Projeto "${project.title}" foi aprovado`,
          user: project.owner?.name || 'Usuário desconhecido',
          timestamp: project.updatedAt.toISOString(),
          projectId: project.id
        });
      });

      // Ordenar por timestamp e pegar os mais recentes
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      res.json({
        success: true,
        data: sortedActivities
      });

    } catch (error) {
      console.error('Erro ao buscar atividades detalhadas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Dashboard de atividades recentes (compatibilidade)
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
          recentUsers,
          recentProjects
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