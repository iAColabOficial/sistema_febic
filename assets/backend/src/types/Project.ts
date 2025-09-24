import { Category, ProjectStatus, UserRole } from '@prisma/client';

// ===== INTERFACES BASE =====
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  state?: string;
}

export interface AreaConhecimento {
  id: string;
  sigla: string;
  nome: string;
  nivel: number;
  paiId?: string;
  pai?: {
    sigla: string;
    nome: string;
  };
}

export interface ProjectMember {
  id: string;
  name: string;
  email?: string;
  cpf?: string;
  rg?: string;
  birthDate: Date;
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

export interface ProjectOrientador {
  id: string;
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

export interface ProjectDocument {
  id: string;
  name: string;
  description?: string;
  version: number;
  isRequired: boolean;
  isApproved?: boolean;
  isPublic: boolean;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}

export interface FeiraAfiliada {
  id: string;
  name: string;
  city: string;
  state: string;
  year: number;
}

// ===== INTERFACES PARA CRIAÇÃO =====
export interface CreateProjectRequest {
  title: string;
  summary: string;
  objective: string;
  methodology: string;
  results?: string;
  conclusion?: string;
  bibliography?: string;
  category: Category;
  areaConhecimentoId: string;
  keywords?: string[];
  researchLine?: string;
  institution: string;
  institutionCity: string;
  institutionState: string;
  institutionCountry?: string;
  isPublicSchool?: boolean;
  isRuralSchool?: boolean;
  isIndigenous?: boolean;
  hasDisability?: boolean;
  socialVulnerability?: boolean;
}

export interface UpdateProjectRequest {
  title?: string;
  summary?: string;
  objective?: string;
  methodology?: string;
  results?: string;
  conclusion?: string;
  bibliography?: string;
  category?: Category;
  areaConhecimentoId?: string;
  keywords?: string[];
  researchLine?: string;
  institution?: string;
  institutionCity?: string;
  institutionState?: string;
  institutionCountry?: string;
  isPublicSchool?: boolean;
  isRuralSchool?: boolean;
  isIndigenous?: boolean;
  hasDisability?: boolean;
  socialVulnerability?: boolean;
}

// ===== INTERFACE PRINCIPAL DO PROJETO =====
export interface ProjectResponse {
  id: string;
  title: string;
  summary: string;
  objective: string;
  methodology: string;
  results?: string;
  conclusion?: string;
  bibliography?: string;
  category: Category;
  keywords: string[];
  researchLine?: string;
  institution: string;
  institutionCity: string;
  institutionState: string;
  institutionCountry: string;
  isPublicSchool: boolean;
  isRuralSchool: boolean;
  isIndigenous: boolean;
  hasDisability: boolean;
  socialVulnerability: boolean;
  status: ProjectStatus;
  currentStage?: string;
  isPaid: boolean;
  paymentRequired: boolean;
  paymentAmount: number;
  paymentDueDate?: Date;
  isPaymentExempt: boolean;
  exemptionReason?: string;
  submissionDate?: Date;
  ciasResultDate?: Date;
  virtualStartDate?: Date;
  virtualEndDate?: Date;
  presentialDate?: Date;
  passedCias: boolean;
  passedVirtual: boolean;
  isFinalist: boolean;
  isAwarded: boolean;
  ownerId: string;
  areaConhecimentoId: string;
  feiraAfiliadaId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  owner: User;
  areaConhecimento: AreaConhecimento;
  members?: ProjectMember[];
  orientadores?: ProjectOrientador[];
  documents?: ProjectDocument[];
  feiraAfiliada?: FeiraAfiliada;
  
  // Contadores
  _count?: {
    members: number;
    orientadores: number;
    documents: number;
  };
}

// ===== INTERFACE RESUMIDA PARA LISTAS =====
export interface ProjectListItem {
  id: string;
  title: string;
  summary: string;
  category: Category;
  status: ProjectStatus;
  institution: string;
  institutionCity: string;
  institutionState: string;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  areaConhecimento: {
    id: string;
    sigla: string;
    nome: string;
    nivel: number;
  };
  members: {
    id: string;
    name: string;
    schoolLevel: string;
    schoolYear?: string;
  }[];
  orientadores: {
    id: string;
    name: string;
    formation: string;
    institution: string;
  }[];
  _count: {
    members: number;
    orientadores: number;
    documents: number;
  };
}

// ===== INTERFACES PARA REQUESTS DE MEMBROS =====
export interface CreateMemberRequest {
  name: string;
  email?: string;
  cpf?: string;
  rg?: string;
  birthDate: string; // ISO date string
  gender: string;
  phone?: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  schoolLevel: string;
  schoolYear?: string;
  institution: string;
  isIndigenous?: boolean;
  hasDisability?: boolean;
  isRural?: boolean;
}

export interface CreateOrientadorRequest {
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

// ===== INTERFACE PARA ESTATÍSTICAS =====
export interface ProjectStats {
  total: number;
  rascunho: number;
  submetidos: number;
  aprovados: number;
  reprovados: number;
  finalistasPresencial: number;
  premiados: number;
}

// ===== CONSTANTES ATUALIZADAS =====
export const CATEGORY_INFO = {
  I: { 
    label: 'Categoria I', 
    description: 'Educação Infantil', 
    maxMembers: 6,
    ageRange: '3-6 anos',
    level: 'Educação Infantil'
  },
  II: { 
    label: 'Categoria II', 
    description: 'Ensino Fundamental 1º-3º', 
    maxMembers: 5,
    ageRange: '1º-3º ano',
    level: 'Ensino Fundamental I'
  },
  III: { 
    label: 'Categoria III', 
    description: 'Ensino Fundamental 4º-6º', 
    maxMembers: 5,
    ageRange: '4º-6º ano',
    level: 'Ensino Fundamental I'
  },
  IV: { 
    label: 'Categoria IV', 
    description: 'Ensino Fundamental 7º-9º', 
    maxMembers: 3,
    ageRange: '7º-9º ano',
    level: 'Ensino Fundamental II'
  },
  V: { 
    label: 'Categoria V', 
    description: 'Ensino Médio', 
    maxMembers: 3,
    ageRange: 'Ensino Médio',
    level: 'Ensino Médio'
  },
  VI: { 
    label: 'Categoria VI', 
    description: 'Educação de Jovens e Adultos (EJA)', 
    maxMembers: 3,
    ageRange: 'EJA',
    level: 'EJA'
  },
  VII: { 
    label: 'Categoria VII', 
    description: 'Técnico', 
    maxMembers: 3,
    ageRange: 'Técnico',
    level: 'Ensino Técnico'
  },
  VIII: { 
    label: 'Categoria VIII', 
    description: 'Ensino Superior', 
    maxMembers: 3,
    ageRange: 'Superior',
    level: 'Ensino Superior'
  },
  IX: { 
    label: 'Categoria IX', 
    description: 'Pós-graduação', 
    maxMembers: 3,
    ageRange: 'Pós-graduação',
    level: 'Pós-graduação'
  },
  RELATO: { 
    label: 'RELATO', 
    description: 'Experiência Científico-Pedagógica', 
    maxMembers: -1,
    ageRange: 'Educadores',
    level: 'Relato de Experiência'
  }
} as const;

export const STATUS_INFO = {
  RASCUNHO: { 
    label: 'Rascunho', 
    color: 'gray', 
    description: 'Projeto em desenvolvimento'
  },
  SUBMETIDO: { 
    label: 'Submetido', 
    color: 'blue', 
    description: 'Aguardando análise CIAS'
  },
  EM_ANALISE_CIAS: { 
    label: 'Em Análise CIAS', 
    color: 'yellow', 
    description: 'Sendo analisado pela equipe CIAS'
  },
  APROVADO_CIAS: { 
    label: 'Aprovado CIAS', 
    color: 'green', 
    description: 'Aprovado para etapa virtual'
  },
  REPROVADO_CIAS: { 
    label: 'Reprovado CIAS', 
    color: 'red', 
    description: 'Não classificado na etapa CIAS'
  },
  AGUARDANDO_PAGAMENTO: { 
    label: 'Aguardando Pagamento', 
    color: 'orange', 
    description: 'Aguardando confirmação de pagamento'
  },
  CONFIRMADO_VIRTUAL: { 
    label: 'Confirmado Virtual', 
    color: 'blue', 
    description: 'Participando da etapa virtual'
  },
  FINALISTA_PRESENCIAL: { 
    label: 'Finalista Presencial', 
    color: 'purple', 
    description: 'Classificado para apresentação presencial'
  },
  PREMIADO: { 
    label: 'Premiado', 
    color: 'gold', 
    description: 'Projeto premiado na FEBIC'
  },
  ARQUIVADO: { 
    label: 'Arquivado', 
    color: 'gray', 
    description: 'Projeto arquivado'
  }
} as const;

export const USER_ROLE_INFO = {
  ADMINISTRADOR: {
    label: 'Administrador',
    permissions: ['VIEW_ALL', 'EDIT_ALL', 'DELETE_ALL', 'MANAGE_USERS', 'CHANGE_STATUS']
  },
  AUTOR: {
    label: 'Autor',
    permissions: ['VIEW_OWN', 'CREATE', 'EDIT_OWN_DRAFT', 'DELETE_OWN_DRAFT']
  },
  AVALIADOR: {
    label: 'Avaliador',
    permissions: ['VIEW_ASSIGNED', 'EVALUATE']
  },
  ORIENTADOR: {
    label: 'Orientador',
    permissions: ['VIEW_ORIENTED', 'COMMENT']
  },
  FEIRA_AFILIADA: {
    label: 'Feira Afiliada',
    permissions: ['VIEW_OWN_FAIR', 'MANAGE_OWN_PROJECTS']
  },
  FINANCEIRO: {
    label: 'Financeiro',
    permissions: ['VIEW_PAYMENTS', 'MANAGE_PAYMENTS']
  }
} as const;

// ===== TIPOS UTILITÁRIOS =====
export type CategoryKey = keyof typeof CATEGORY_INFO;
export type StatusKey = keyof typeof STATUS_INFO;
export type UserRoleKey = keyof typeof USER_ROLE_INFO;

// ===== VALIDADORES =====
export const isValidCategory = (category: string): category is Category => {
  return Object.keys(CATEGORY_INFO).includes(category);
};

export const isValidStatus = (status: string): status is ProjectStatus => {
  return Object.keys(STATUS_INFO).includes(status);
};

export const getMaxMembersForCategory = (category: Category): number => {
  return CATEGORY_INFO[category].maxMembers;
};

export const getStatusColor = (status: ProjectStatus): string => {
  return STATUS_INFO[status].color;
};

export const getStatusLabel = (status: ProjectStatus): string => {
  return STATUS_INFO[status].label;
};

export const getCategoryLabel = (category: Category): string => {
  return CATEGORY_INFO[category].label;
};