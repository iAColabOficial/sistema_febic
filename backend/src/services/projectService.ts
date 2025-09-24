import { PrismaClient, Category, ProjectStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Interfaces baseadas no regulamento FEBIC
interface ProjectMemberData {
  userId?: string;
  name: string;
  email?: string;
  cpf?: string;
  rg?: string;
  birthDate: string;
  gender: string;
  phone?: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  schoolLevel: string;
  schoolYear?: string;
  institution: string;
  isIndigenous: boolean;
  hasDisability: boolean;
  isRural: boolean;
}

interface ProjectOrientadorData {
  userId?: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  formation: string;
  area: string;
  institution: string;
  position?: string;
  city: string;
  state: string;
  yearsExperience?: number;
  lattesUrl?: string;
}

interface CreateProjectData {
  // Dados básicos do projeto
  title: string;
  summary: string;
  objective: string;
  methodology: string;
  results?: string;
  conclusion?: string;
  bibliography?: string;
  
  // Categoria e área
  category: Category;
  areaConhecimentoId: string;
  keywords: string[];
  researchLine?: string;
  
  // Dados institucionais
  institution: string;
  institutionCity: string;
  institutionState: string;
  institutionCountry: string;
  isPublicSchool: boolean;
  isRuralSchool: boolean;
  isIndigenous: boolean;
  hasDisability: boolean;
  socialVulnerability: boolean;
  
  // Integrantes e orientadores
  members: ProjectMemberData[];
  orientadores: ProjectOrientadorData[];
  
  // Dados de pagamento/financeiros
  paymentRequired: boolean;
  isPaymentExempt: boolean;
  exemptionReason?: string;
}

// Regras de integrantes por categoria (baseado no regulamento)
const CATEGORY_MEMBER_LIMITS = {
  I: 6,    // Educação Infantil
  II: 5,   // Ensino Fundamental 1º-6º
  III: 3,  // Ensino Fundamental 7º-9º
  IV: 3,   // Ensino Técnico Subsequente
  V: 3,    // EJA
  VI: 3,   // Ensino Médio
  VII: 3,  // Ensino Superior
  VIII: 3, // Pós-graduação
  IX: 3,   // Adicional se necessário
  RELATO: 3 // Relato de Experiência
};

export class ProjectService {
  // Buscar usuário por CPF
  static async findUserByCPF(cpf: string) {
    const cleanCPF = cpf.replace(/\D/g, '');
    return await prisma.user.findUnique({
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
  }

  // Criar projeto com validações FEBIC
  static async createProject(data: CreateProjectData, ownerId: string) {
    // Validações básicas
    if (!data.title?.trim()) {
      throw new Error('Título do projeto é obrigatório');
    }

    if (!data.summary?.trim()) {
      throw new Error('Resumo do projeto é obrigatório');
    }

    if (!data.objective?.trim()) {
      throw new Error('Objetivo do projeto é obrigatório');
    }

    if (!data.methodology?.trim()) {
      throw new Error('Metodologia do projeto é obrigatória');
    }

    // Validar categoria
    if (!Object.keys(CATEGORY_MEMBER_LIMITS).includes(data.category)) {
      throw new Error('Categoria inválida');
    }

    // Validar número de integrantes por categoria
    const maxMembers = CATEGORY_MEMBER_LIMITS[data.category];
    if (data.members.length > maxMembers) {
      throw new Error(`Categoria ${data.category} permite no máximo ${maxMembers} integrantes`);
    }

    if (data.members.length === 0) {
      throw new Error('Pelo menos um integrante é obrigatório');
    }

    // Validar orientadores
    if (data.orientadores.length === 0) {
      throw new Error('Pelo menos um orientador é obrigatório');
    }

    if (data.orientadores.length > 2) {
      throw new Error('Máximo de 2 orientadores permitido (1 orientador + 1 coorientador)');
    }

    // Verificar se área de conhecimento existe
    const areaExists = await prisma.areaConhecimento.findUnique({
      where: { id: data.areaConhecimentoId }
    });

    if (!areaExists) {
      throw new Error('Área de conhecimento não encontrada');
    }

    // Validar dados dos integrantes
    for (const member of data.members) {
      if (!member.name?.trim()) {
        throw new Error('Nome do integrante é obrigatório');
      }

      if (!member.birthDate) {
        throw new Error('Data de nascimento do integrante é obrigatória');
      }

      if (!member.gender?.trim()) {
        throw new Error('Gênero do integrante é obrigatório');
      }

      if (!member.city?.trim()) {
        throw new Error('Cidade do integrante é obrigatória');
      }

      if (!member.state?.trim()) {
        throw new Error('Estado do integrante é obrigatório');
      }

      if (!member.schoolLevel?.trim()) {
        throw new Error('Nível escolar do integrante é obrigatório');
      }

      if (!member.institution?.trim()) {
        throw new Error('Instituição do integrante é obrigatória');
      }

      // Validar CPF se fornecido
      if (member.cpf && member.cpf.replace(/\D/g, '').length !== 11) {
        throw new Error(`CPF inválido para integrante ${member.name}`);
      }
    }

    // Validar dados dos orientadores
    for (const orientador of data.orientadores) {
      if (!orientador.name?.trim()) {
        throw new Error('Nome do orientador é obrigatório');
      }

      if (!orientador.email?.trim()) {
        throw new Error('Email do orientador é obrigatório');
      }

      if (!orientador.formation?.trim()) {
        throw new Error('Formação do orientador é obrigatória');
      }

      if (!orientador.area?.trim()) {
        throw new Error('Área do orientador é obrigatória');
      }

      if (!orientador.institution?.trim()) {
        throw new Error('Instituição do orientador é obrigatória');
      }

      if (!orientador.city?.trim()) {
        throw new Error('Cidade do orientador é obrigatória');
      }

      if (!orientador.state?.trim()) {
        throw new Error('Estado do orientador é obrigatório');
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(orientador.email)) {
        throw new Error(`Email inválido para orientador ${orientador.name}`);
      }

      // Validar CPF se fornecido
      if (orientador.cpf && orientador.cpf.replace(/\D/g, '').length !== 11) {
        throw new Error(`CPF inválido para orientador ${orientador.name}`);
      }
    }

    // Criar projeto
    try {
      const project = await prisma.project.create({
        data: {
          title: data.title.trim(),
          summary: data.summary.trim(),
          objective: data.objective.trim(),
          methodology: data.methodology.trim(),
          results: data.results?.trim() || null,
          conclusion: data.conclusion?.trim() || null,
          bibliography: data.bibliography?.trim() || null,
          
          category: data.category,
          areaConhecimentoId: data.areaConhecimentoId,
          keywords: data.keywords,
          researchLine: data.researchLine?.trim() || null,
          
          institution: data.institution.trim(),
          institutionCity: data.institutionCity.trim(),
          institutionState: data.institutionState.trim(),
          institutionCountry: data.institutionCountry.trim() || 'Brasil',
          isPublicSchool: data.isPublicSchool,
          isRuralSchool: data.isRuralSchool,
          isIndigenous: data.isIndigenous,
          hasDisability: data.hasDisability,
          socialVulnerability: data.socialVulnerability,
          
          status: ProjectStatus.RASCUNHO,
          paymentRequired: data.paymentRequired,
          isPaymentExempt: data.isPaymentExempt,
          exemptionReason: data.exemptionReason?.trim() || null,
          
          ownerId: ownerId,
          
          // Criar integrantes
          members: {
            create: data.members.map(member => ({
              userId: member.userId || null,
              name: member.name.trim(),
              email: member.email?.trim() || null,
              cpf: member.cpf ? member.cpf.replace(/\D/g, '') : null,
              rg: member.rg?.trim() || null,
              birthDate: new Date(member.birthDate),
              gender: member.gender.trim(),
              phone: member.phone?.trim() || null,
              address: member.address?.trim() || null,
              city: member.city.trim(),
              state: member.state.trim(),
              zipCode: member.zipCode ? member.zipCode.replace(/\D/g, '') : null,
              schoolLevel: member.schoolLevel.trim(),
              schoolYear: member.schoolYear?.trim() || null,
              institution: member.institution.trim(),
              isIndigenous: member.isIndigenous,
              hasDisability: member.hasDisability,
              isRural: member.isRural
            }))
          },
          
          // Criar orientadores
          orientadores: {
            create: data.orientadores.map(orientador => ({
              userId: orientador.userId || null,
              name: orientador.name.trim(),
              email: orientador.email.trim(),
              cpf: orientador.cpf ? orientador.cpf.replace(/\D/g, '') : null,
              phone: orientador.phone?.trim() || null,
              formation: orientador.formation.trim(),
              area: orientador.area.trim(),
              institution: orientador.institution.trim(),
              position: orientador.position?.trim() || null,
              city: orientador.city.trim(),
              state: orientador.state.trim(),
              yearsExperience: orientador.yearsExperience || null,
              lattesUrl: orientador.lattesUrl?.trim() || null
            }))
          }
        },
        include: {
          members: true,
          orientadores: true,
          areaConhecimento: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      return project;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw new Error('Erro interno ao criar projeto');
    }
  }

  // Obter projetos (existente - manter como estava)
  static async getProjects(userRole: string, userId: string, filters?: any) {
    const whereClause: any = {};

    // Aplicar filtros baseados no role
    if (userRole !== 'ADMINISTRADOR') {
      whereClause.ownerId = userId;
    }

    // Aplicar filtros adicionais
    if (filters?.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.category) {
      whereClause.category = filters.category;
    }

    return await prisma.project.findMany({
      where: whereClause,
      include: {
        members: true,
        orientadores: true,
        areaConhecimento: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Obter projeto por ID (existente - manter)
  static async getProjectById(projectId: string, userRole: string, userId: string) {
    const whereClause: any = { id: projectId };

    // Se não for admin, só pode ver próprios projetos
    if (userRole !== 'ADMINISTRADOR') {
      whereClause.ownerId = userId;
    }

    return await prisma.project.findFirst({
      where: whereClause,
      include: {
        members: true,
        orientadores: true,
        areaConhecimento: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  // Buscar áreas de conhecimento
  static async getAreas(nivel?: number) {
    const whereClause: any = { isActive: true };
    
    if (nivel !== undefined) {
      whereClause.nivel = nivel;
    }

    return await prisma.areaConhecimento.findMany({
      where: whereClause,
      orderBy: [
        { nivel: 'asc' },
        { nome: 'asc' }
      ]
    });
  }

  // EstatÃ­sticas do projeto
static async getProjectStats(userRole: string, userId: string) {
  const whereClause: any = {};

  if (userRole !== 'ADMINISTRADOR') {
    whereClause.ownerId = userId;
  }

  const [
    total,
    rascunho,
    submetido,
    emAnalise,
    aprovado,
    reprovado,
    aguardandoPagamento,
    confirmadoVirtual,
    finalistaPresencial,
    premiado,
    arquivado
  ] = await Promise.all([
    prisma.project.count({ where: whereClause }),
    prisma.project.count({ where: { ...whereClause, status: 'RASCUNHO' } }),
    prisma.project.count({ where: { ...whereClause, status: 'SUBMETIDO' } }),
    prisma.project.count({ where: { ...whereClause, status: 'EM_ANALISE_CIAS' } }),
    prisma.project.count({ where: { ...whereClause, status: 'APROVADO_CIAS' } }),
    prisma.project.count({ where: { ...whereClause, status: 'REPROVADO_CIAS' } }),
    prisma.project.count({ where: { ...whereClause, status: 'AGUARDANDO_PAGAMENTO' } }),
    prisma.project.count({ where: { ...whereClause, status: 'CONFIRMADO_VIRTUAL' } }),
    prisma.project.count({ where: { ...whereClause, status: 'FINALISTA_PRESENCIAL' } }),
    prisma.project.count({ where: { ...whereClause, status: 'PREMIADO' } }),
    prisma.project.count({ where: { ...whereClause, status: 'ARQUIVADO' } })
  ]);

  return {
    total,
    byStatus: {
      RASCUNHO: rascunho,
      SUBMETIDO: submetido,
      EM_ANALISE_CIAS: emAnalise,
      APROVADO_CIAS: aprovado,
      REPROVADO_CIAS: reprovado,
      AGUARDANDO_PAGAMENTO: aguardandoPagamento,
      CONFIRMADO_VIRTUAL: confirmadoVirtual,
      FINALISTA_PRESENCIAL: finalistaPresencial,
      PREMIADO: premiado,
      ARQUIVADO: arquivado
    },
    byCategory: {
      I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0, VII: 0, VIII: 0, IX: 0, RELATO: 0
    }
  };
}
// Atualizar projeto
  static async updateProject(projectId: string, data: any, userRole: string, userId: string) {
    const whereClause: any = { id: projectId };

    if (userRole !== 'ADMINISTRADOR') {
      whereClause.ownerId = userId;
    }

    const project = await prisma.project.findFirst({ where: whereClause });
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    return await prisma.project.update({
      where: { id: projectId },
      data: {
        title: data.title?.trim(),
        summary: data.summary?.trim(),
        objective: data.objective?.trim(),
        methodology: data.methodology?.trim(),
        results: data.results?.trim() || null,
        conclusion: data.conclusion?.trim() || null,
        bibliography: data.bibliography?.trim() || null,
        category: data.category,
        areaConhecimentoId: data.areaConhecimentoId,
        keywords: data.keywords || [],
        institution: data.institution?.trim(),
        institutionCity: data.institutionCity?.trim(),
        institutionState: data.institutionState?.trim(),
        updatedAt: new Date()
      },
      include: {
        members: true,
        orientadores: true,
        areaConhecimento: true,
        owner: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  // Deletar projeto
  static async deleteProject(projectId: string, userRole: string, userId: string) {
    const whereClause: any = { id: projectId };

    if (userRole !== 'ADMINISTRADOR') {
      whereClause.ownerId = userId;
    }

    const project = await prisma.project.findFirst({ where: whereClause });
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    if (project.status !== 'RASCUNHO') {
      throw new Error('Apenas projetos em rascunho podem ser excluídos');
    }

    await prisma.project.delete({ where: { id: projectId } });
  }

  // Submeter projeto
  static async submitProject(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId }
    });

    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    if (project.status !== 'RASCUNHO') {
      throw new Error('Apenas projetos em rascunho podem ser submetidos');
    }

    return await prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.SUBMETIDO,
        submissionDate: new Date()
      },
      include: {
        members: true,
        orientadores: true,
        areaConhecimento: true,
        owner: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  // Atualizar status (admin apenas)
  static async updateStatus(projectId: string, status: string, userRole: string) {
    if (userRole !== 'ADMINISTRADOR') {
      throw new Error('Apenas administradores podem alterar status');
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    return await prisma.project.update({
      where: { id: projectId },
      data: { status: status as ProjectStatus },
      include: {
        members: true,
        orientadores: true,
        areaConhecimento: true,
        owner: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }
} // <- Esta é a chave de fechamento da classe