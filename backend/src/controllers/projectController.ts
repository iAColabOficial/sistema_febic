import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    // 🔍 DEBUG - Vamos ver o que está chegando
    console.log('=== DEBUG CREATE PROJECT ===');
    console.log('User ID:', userId);
    console.log('Request Body Keys:', Object.keys(req.body));
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('================================');

    // 📋 Buscar dados do usuário logado para inserir como autor automaticamente
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        birthDate: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        institution: true,
        formation: true,
        role: true,
        position: true
      }
    });

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // 🎯 LÓGICA CORRETA: Inserir usuário baseado no seu ROLE
    const { members = [], orientadores = [] } = req.body;

    if (currentUser.role === 'AUTOR') {
      // AUTOR: Adicionar automaticamente como ProjectMember
      const autorMember = {
        userId: userId,
        name: currentUser.name,
        email: currentUser.email ?? '',
        cpf: currentUser.cpf ?? '',
        phone: currentUser.phone ?? '',
        birthDate: currentUser.birthDate ?? new Date(),
        gender: currentUser.gender ?? 'Prefiro não informar',
        address: currentUser.address ?? '',
        city: currentUser.city ?? '',
        state: currentUser.state ?? '',
        zipCode: currentUser.zipCode ?? '',
        schoolLevel: getSchoolLevelFromFormation(currentUser.formation),
        schoolYear: '',
        institution: currentUser.institution ?? req.body.institution ?? '',
        isIndigenous: false,
        hasDisability: false,
        isRural: false
      };

      // Adicionar o autor aos members
      members.unshift(autorMember);
      
      // Validação: AUTOR deve ter orientadores
      if (!orientadores || orientadores.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'É obrigatório ter pelo menos um orientador'
        });
      }

    } else if (currentUser.role === 'ORIENTADOR') {
      // ORIENTADOR: Adicionar automaticamente como ProjectOrientador
      const orientadorData = {
        userId: userId,
        name: currentUser.name,
        email: currentUser.email ?? '',
        cpf: currentUser.cpf ?? '',
        phone: currentUser.phone ?? '',
        formation: currentUser.formation ?? 'Não informado',
        area: req.body.researchLine || currentUser.formation || 'Área não especificada',
        institution: currentUser.institution ?? req.body.institution ?? '',
        position: currentUser.position ?? 'Orientador',
        city: currentUser.city ?? '',
        state: currentUser.state ?? '',
        yearsExperience: 0,
        lattesUrl: ''
      };

      // Adicionar o orientador aos orientadores
      orientadores.unshift(orientadorData);
      
      // Validação: ORIENTADOR deve ter membros/autores
      if (!members || members.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Orientador deve adicionar pelo menos um autor/membro ao projeto'
        });
      }
    }

    // 🛡️ VALIDAÇÃO: Verificar conflitos autor/orientador
    const memberEmails = members.map((m: any) => m.email).filter(Boolean);
    const memberCpfs = members.map((m: any) => m.cpf).filter(Boolean);
    const orientadorEmails = orientadores.map((o: any) => o.email).filter(Boolean);
    const orientadorCpfs = orientadores.map((o: any) => o.cpf).filter(Boolean);

    // Verificar se há sobreposição entre autores e orientadores
    const emailConflict = memberEmails.some((email: string) => orientadorEmails.includes(email));
    const cpfConflict = memberCpfs.some((cpf: string) => orientadorCpfs.includes(cpf));

    if (emailConflict || cpfConflict) {
      return res.status(400).json({
        success: false,
        message: 'Uma pessoa não pode ser autor e orientador do mesmo projeto'
      });
    }

    // Preparar dados do projeto com as listas atualizadas
    const {
      title,
      summary,
      objective,
      methodology,
      results,
      conclusion,
      bibliography,
      category,
      areaConhecimentoId,
      keywords = [],
      researchLine,
      institution,
      institutionCity,
      institutionState,
      institutionCountry = 'Brasil',
      isPublicSchool = false,
      isRuralSchool = false,
      isIndigenous = false,
      hasDisability = false,
      socialVulnerability = false,
      paymentRequired = true,
      isPaymentExempt = false,
      exemptionReason,
    } = req.body;

    // 🗃️ Criar projeto com transação para garantir consistência
    const project = await prisma.$transaction(async (tx) => {
      // 1. Criar o projeto principal
      const newProject = await tx.project.create({
        data: {
          title,
          summary,
          objective,
          methodology,
          results: results || '',
          conclusion: conclusion || '',
          bibliography: bibliography || '',
          category,
          areaConhecimentoId,
          keywords,
          researchLine: researchLine || '',
          institution,
          institutionCity: institutionCity || '',
          institutionState: institutionState || '',
          institutionCountry,
          isPublicSchool,
          isRuralSchool,
          isIndigenous,
          hasDisability,
          socialVulnerability,
          paymentRequired,
          isPaymentExempt,
          exemptionReason: exemptionReason || '',
          status: 'RASCUNHO',
          ownerId: userId
        }
      });

      // 2. Adicionar integrantes (authors) - COM FILTRO DE DUPLICAÇÃO
      if (members && members.length > 0) {
        // ⚠️ CORREÇÃO: Filtrar duplicatas por CPF
        console.log('=== DEBUG MEMBROS AUTOR ===');
        console.log('Usuário logado:', currentUser.id, currentUser.cpf);
        console.log('Total membros recebidos:', members.length);
        console.log('CPFs dos membros:', members.map((m: any) => m.cpf));

        // Filtrar duplicatas por CPF
        const membersUnicos = members.filter((member: any, index: number, self: any[]) => {
          const firstIndex = self.findIndex((m: any) => m.cpf === member.cpf);
          if (index !== firstIndex) {
            console.log('🔄 Removendo membro duplicado por CPF:', member.name, member.cpf);
            return false;
          }
          return true;
        });

        console.log('Membros após remover duplicatas:', membersUnicos.length);

        const membersData = membersUnicos.map((member: any) => ({
          projectId: newProject.id,
          userId: member.userId || null,
          name: member.name,
          email: member.email || '',
          cpf: member.cpf || '',
          rg: member.rg || '',
          birthDate: new Date(member.birthDate),
          gender: member.gender,
          phone: member.phone || '',
          address: member.address || '',
          city: member.city,
          state: member.state,
          zipCode: member.zipCode || '',
          schoolLevel: member.schoolLevel,
          schoolYear: member.schoolYear || '',
          institution: member.institution,
          isIndigenous: member.isIndigenous || false,
          hasDisability: member.hasDisability || false,
          isRural: member.isRural || false
        }));

        await tx.projectMember.createMany({
          data: membersData
        });
      }

      // 3. Adicionar orientadores (mantém a validação existente)
      if (orientadores && orientadores.length > 0) {
        // ✅ MANTER ESTA VALIDAÇÃO PARA REMOVER DUPLICATAS DE ORIENTADORES
        const orientadoresUnicos = orientadores.filter((orientador: any, index: number, self: any[]) => 
          index === self.findIndex((o: any) => o.email === orientador.email)
        );

        if (orientadoresUnicos.length !== orientadores.length) {
          console.log('⚠️ Orientadores duplicados removidos:', orientadores.length - orientadoresUnicos.length);
        }

        const orientadoresData = orientadoresUnicos.map((orientador: any) => ({
          projectId: newProject.id,
          userId: orientador.userId || null,
          name: orientador.name,
          email: orientador.email,
          cpf: orientador.cpf || '',
          phone: orientador.phone || '',
          formation: orientador.formation,
          area: orientador.area,
          institution: orientador.institution,
          position: orientador.position || '',
          city: orientador.city || '',
          state: orientador.state || '',
          yearsExperience: orientador.yearsExperience || 0,
          lattesUrl: orientador.lattesUrl || ''
        }));

        await tx.projectOrientador.createMany({
          data: orientadoresData
        });
      }

      // 4. Retornar projeto completo com relacionamentos
      return await tx.project.findUnique({
        where: { id: newProject.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              schoolLevel: true,
              institution: true
            }
          },
          orientadores: {
            select: {
              id: true,
              name: true,
              email: true,
              formation: true,
              institution: true
            }
          },
          areaConhecimento: {
            select: {
              id: true,
              sigla: true,
              nome: true,
              nivel: true
            }
          }
        }
      });
    });

    console.log('✅ Projeto criado com sucesso:', project?.id);
    
    res.status(201).json({ 
      success: true, 
      data: project,
      message: 'Projeto criado com sucesso! Você foi automaticamente adicionado como autor.'
    });

  } catch (error) {
    // 🔍 DEBUG - Vamos ver o erro completo
    console.error('=== ERRO CREATE PROJECT ===');
    console.error('Error objeto:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Erro interno');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('===============================');
    
    const message = error instanceof Error ? error.message : 'Erro interno';
    res.status(400).json({ success: false, message });
  }
};

// 🎓 Helper function para determinar nível escolar baseado na formação
function getSchoolLevelFromFormation(formation?: string | null): string {
  if (!formation) return 'Ensino Superior';
  
  const formationLower = formation.toLowerCase();
  
  if (formationLower.includes('doutorado') || formationLower.includes('phd')) {
    return 'Pós-graduação';
  }
  
  if (formationLower.includes('mestrado') || formationLower.includes('master')) {
    return 'Pós-graduação';
  }
  
  if (formationLower.includes('especialização') || formationLower.includes('pós-graduação')) {
    return 'Pós-graduação';
  }
  
  if (formationLower.includes('superior') || formationLower.includes('graduação') || formationLower.includes('bacharel')) {
    return 'Ensino Superior';
  }
  
  if (formationLower.includes('técnico')) {
    return 'Ensino Técnico';
  }
  
  if (formationLower.includes('médio')) {
    return 'Ensino Médio';
  }
  
  // Default para casos não identificados
  return 'Ensino Superior';
}

// 📊 Modificar getProjects para incluir filtros de orientador
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    let whereClause: any = {};

    // 🎯 Filtros baseados no role do usuário
    if (userRole === 'AUTOR') {
      // Autor só vê projetos onde é membro OU owner
      whereClause = {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      };
    } else if (userRole === 'ORIENTADOR') {
      // Orientador vê projetos onde é orientador
      whereClause = {
        orientadores: {
          some: {
            userId: userId
          }
        }
      };
    } else if (userRole === 'ADMINISTRADOR') {
      // Admin vê todos os projetos
      whereClause = {};
    } else {
      // Outros roles veem apenas seus próprios projetos
      whereClause = { ownerId: userId };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            schoolLevel: true,
            institution: true
          }
        },
        orientadores: {
          select: {
            id: true,
            name: true,
            email: true,
            formation: true,
            institution: true
          }
        },
        areaConhecimento: {
          select: {
            id: true,
            sigla: true,
            nome: true,
            nivel: true,
           }
          },
          _count: {
            select: {
              members: true,
              orientadores: true
            }
          }
        },  
      orderBy: {
        createdAt: 'desc' }
      });

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// 📈 Modificar getProjectStats para considerar roles
export const getProjectStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    let whereClause: any = {};

    // Mesma lógica de filtro que getProjects
    if (userRole === 'AUTOR') {
      whereClause = {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      };
    } else if (userRole === 'ORIENTADOR') {
      whereClause = {
        orientadores: {
          some: {
            userId: userId
          }
        }
      };
    } else if (userRole === 'ADMINISTRADOR') {
      whereClause = {};
    } else {
      whereClause = { ownerId: userId };
    }

    // Buscar estatísticas
    const [total, byStatus] = await Promise.all([
      prisma.project.count({ where: whereClause }),
      prisma.project.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true
      })
    ]);

    // Formatar estatísticas por status
    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      total,
      byStatus: statusStats
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Manter as outras funções existentes inalteradas
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const projectId = req.params.id;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    // Buscar o projeto com validação de acesso baseada no role
    let whereClause: any = { id: projectId };

    if (userRole === 'AUTOR') {
      whereClause = {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      };
    } else if (userRole === 'ORIENTADOR') {
      whereClause = {
        id: projectId,
        orientadores: {
          some: {
            userId: userId
          }
        }
      };
    }
    // Admin pode ver qualquer projeto

    const project = await prisma.project.findFirst({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: true,
        orientadores: true,
        areaConhecimento: true,
        documents: true
      }
    });
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const projectId = req.params.id;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    // Buscar o projeto com validação de acesso
    let whereClause: any = { id: projectId };

    if (userRole === 'AUTOR') {
      whereClause = {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      };
    } else if (userRole === 'ORIENTADOR') {
      whereClause = {
        id: projectId,
        orientadores: {
          some: {
            userId: userId
          }
        }
      };
    }

    const existingProject = await prisma.project.findFirst({
      where: whereClause,
      include: {
        orientadores: true,
        members: true
      }
    });

    if (!existingProject) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projeto não encontrado ou você não tem permissão para editá-lo' 
      });
    }

    // Verificar se o projeto pode ser editado baseado no status
    if (existingProject.status === 'FINALISTA_PRESENCIAL' || existingProject.status === 'PREMIADO') {
      return res.status(400).json({
        success: false,
        message: 'Projetos finalistas ou premiados não podem ser editados'
      });
    }

    const {
      title,
      summary,
      objective,
      methodology,
      results,
      conclusion,
      bibliography,
      category,
      areaConhecimentoId,
      keywords,
      researchLine,
      institution,
      institutionCity,
      institutionState,
      institutionCountry,
      isPublicSchool,
      isRuralSchool,
      isIndigenous,
      hasDisability,
      socialVulnerability,
      paymentRequired,
      isPaymentExempt,
      exemptionReason,
      orientadores
    } = req.body;

    // Validar orientadores se fornecidos
    if (orientadores && orientadores.length > 0) {
      const memberEmails = existingProject.members.map(m => m.email).filter(Boolean);
      const memberCpfs = existingProject.members.map(m => m.cpf).filter(Boolean);
      
      const hasConflict = orientadores.some((orientador: any) => 
        memberEmails.includes(orientador.email) || 
        memberCpfs.includes(orientador.cpf)
      );

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Integrantes do projeto não podem ser orientadores'
        });
      }
    }

    // Atualizar projeto usando transação
    const updatedProject = await prisma.$transaction(async (tx) => {
      // Atualizar dados principais do projeto
      const project = await tx.project.update({
        where: { id: projectId },
        data: {
          title,
          summary,
          objective,
          methodology,
          results,
          conclusion,
          bibliography,
          category,
          areaConhecimentoId,
          keywords,
          researchLine,
          institution,
          institutionCity,
          institutionState,
          institutionCountry,
          isPublicSchool,
          isRuralSchool,
          isIndigenous,
          hasDisability,
          socialVulnerability,
          paymentRequired,
          isPaymentExempt,
          exemptionReason
        }
      });

      // Atualizar orientadores se fornecidos
      if (orientadores) {
        // Remover orientadores existentes
        await tx.projectOrientador.deleteMany({
          where: { projectId }
        });

        // Adicionar novos orientadores
        if (orientadores.length > 0) {
          const orientadoresData = orientadores.map((orientador: any) => ({
            projectId,
            userId: orientador.userId || null,
            name: orientador.name,
            email: orientador.email,
            cpf: orientador.cpf || '',
            phone: orientador.phone || '',
            formation: orientador.formation,
            area: orientador.area,
            institution: orientador.institution,
            position: orientador.position || '',
            city: orientador.city || '',
            state: orientador.state || '',
            yearsExperience: orientador.yearsExperience || 0,
            lattesUrl: orientador.lattesUrl || ''
          }));

          await tx.projectOrientador.createMany({
            data: orientadoresData
          });
        }
      }

      // Retornar projeto completo atualizado
      return await tx.project.findUnique({
        where: { id: projectId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              schoolLevel: true,
              institution: true
            }
          },
          orientadores: {
            select: {
              id: true,
              name: true,
              email: true,
              formation: true,
              institution: true
            }
          },
          areaConhecimento: {
            select: {
              id: true,
              sigla: true,
              nome: true,
              nivel: true
            }
          }
        }
      });
    });

    res.json({ 
      success: true, 
      data: updatedProject,
      message: 'Projeto atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    const statusCode = message.includes('não encontrado') ? 404 : 400;
    res.status(statusCode).json({ success: false, message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const projectId = req.params.id;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    // Buscar o projeto com validação de acesso
    let whereClause: any = { id: projectId };

    if (userRole === 'AUTOR') {
      // Autor só pode deletar projetos onde é owner ou membro
      whereClause = {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      };
    } else if (userRole === 'ORIENTADOR') {
      // Orientador só pode deletar projetos onde é orientador
      whereClause = {
        id: projectId,
        orientadores: {
          some: {
            userId: userId
          }
        }
      };
    }
    // Admin pode deletar qualquer projeto

    const project = await prisma.project.findFirst({
      where: whereClause
    });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projeto não encontrado ou você não tem permissão para excluí-lo' 
      });
    }

    // Verificar se o projeto pode ser excluído baseado no status
    if (project.status === 'FINALISTA_PRESENCIAL' || project.status === 'PREMIADO') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir projetos finalistas ou premiados'
      });
    }

    // Excluir projeto usando transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // As relações serão excluídas automaticamente devido ao onDelete: Cascade no schema
      await tx.project.delete({
        where: { id: projectId }
      });
    });

    res.json({ 
      success: true, 
      message: 'Projeto excluído com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    
    // Verificar se é erro de constraint (relações existentes)
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir o projeto pois existem registros relacionados'
      });
    }

    const message = error instanceof Error ? error.message : 'Erro interno';
    const statusCode = message.includes('não encontrado') ? 404 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export const submitProject = async (req: AuthRequest, res: Response) => {
  // Implementação existente mantida
};

export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  // Implementação existente mantida
};

export const getAreasConhecimento = async (req: any, res: Response) => {
  // Implementação existente mantida
};