// ===== ENUMS E CONSTANTES =====

export type ProjectCategory = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'RELATO';

export type ProjectStatus = 
  | 'RASCUNHO' 
  | 'SUBMETIDO' 
  | 'EM_ANALISE_CIAS'
  | 'APROVADO_CIAS'      
  | 'REPROVADO_CIAS'     
  | 'AGUARDANDO_PAGAMENTO' 
  | 'CONFIRMADO_VIRTUAL' 
  | 'FINALISTA_PRESENCIAL' 
  | 'PREMIADO' 
  | 'ARQUIVADO';         

export type MemberRole = 'AUTOR_PRINCIPAL' | 'AUTOR';
export type OrientadorTipo = 'ORIENTADOR' | 'COORIENTADOR';

// ===== INTERFACES PRINCIPAIS =====

export interface Project {
  id: string;
  title: string;
  summary: string;
  objective: string;
  methodology: string;
  results?: string;
  conclusion?: string;
  bibliography?: string;
  category: ProjectCategory;
  areaConhecimentoId: string;
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
  ownerId: string; 
  isPaid: boolean;
  paymentRequired: boolean;
  isPaymentExempt: boolean;
  exemptionReason?: string;
  submissionDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // ✨ NOVO: Feira Afiliada
  feiraAfiliadaId?: string | null;
  
  _count?: {
    members?: number;
    orientadores?: number;
  };
  isCredenciado?: boolean;
  isFullTimeInstitution?: boolean;
  
  // Relacionamentos
  owner?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  areaConhecimento?: {
    id: string;
    sigla: string;
    nome: string;
    nivel: number;
  };
  // ✨ NOVO: Relacionamento com Feira Afiliada
  feiraAfiliada?: {
    id: string;
    name: string;
    city: string;
    state: string;
    edition: string;
    year: number;
  };
  members?: ProjectMember[];
  orientadores?: ProjectOrientador[];
  avaliacoes?: Array<{
    id: string;
    projectId: string;
    avaliadorId: string;
    isCompleted: boolean;
    completedAt: string | null;
    notaFinal: number | null;
    notaInovacao: number | null;
    notaMetodologia: number | null;
    notaRelevancia: number | null;
    notaApresentacao: number | null;
    notaImpacto: number | null;
    notaViabilidade: number | null;
    comentarioGeral: string | null;
    pontosFortes: string | null;
    pontosMelhoria: string | null;
    sugestoes: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface ProjectMemberWithUser {
  id: number;
  projectId: string;
  userId: number;
  role: MemberRole;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProjectOrientadorWithUser {
  id: number;
  projectId: string;
  userId: number;
  tipo: OrientadorTipo;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProjectDocumentInfo {
  id: number;
  projectId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: number;
  createdAt: string;
}

export interface AreaConhecimento {
  id: string;
  sigla: string;
  nome: string;
  nivel: number;
  paiId?: string;
}

// ===== FORMULÁRIOS =====

export interface ProjectMember {
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

export interface ProjectOrientador {
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

export interface CreateProjectData {
  // Dados básicos
  title: string;
  summary: string;
  objective: string;
  methodology: string;
  results?: string;
  conclusion?: string;
  bibliography?: string;
  
  // Categoria e área
  category: ProjectCategory | '';
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
  
  // ✨ NOVO: Feira Afiliada
  feiraAfiliadaId?: string | null;
  
  // Integrantes e orientadores
  members: ProjectMember[];
  orientadores: ProjectOrientador[];
  
  // Dados financeiros
  paymentRequired: boolean;
  isPaymentExempt: boolean;
  exemptionReason?: string;
}

export interface CreateProjectRequest extends CreateProjectData {}

export interface UpdateProjectData {
  title?: string;
  category?: ProjectCategory;
  areaConhecimentoId?: string;
  summary?: string;
  keywords?: string;
  institution?: string;
  institutionState?: string;
  institutionCity?: string;
  isPublicSchool?: boolean;
  isFullTimeInstitution?: boolean;
  // ✨ NOVO: Feira Afiliada
  feiraAfiliadaId?: string | null;
}

// ===== FILTROS =====

export interface ProjectFilters {
  search?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  areaConhecimentoId?: string;
  isCredenciado?: boolean;
  institutionState?: string;
  createdBy?: number;
  // ✨ NOVO: Filtrar por feira
  feiraAfiliadaId?: string;
  page?: number;
  limit?: number;
}

// ===== RESPOSTAS DA API =====

export interface ProjectsListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectStats {
  total: number;
  byStatus: Record<ProjectStatus, number>;
  byCategory: Record<ProjectCategory, number>;
  credenciados: number;
  publicInstitutions: number;
  fullTimeInstitutions: number;
  pendingPayments: number;
}

// ===== CONFIGURAÇÕES POR CATEGORIA =====

export const PROJECT_CATEGORIES = [
  {
    value: 'I' as ProjectCategory,
    label: 'I - Educação Infantil (3-6 anos)',
    maxParticipants: 6,
    ageRange: '3-6 anos'
  },
  {
    value: 'II' as ProjectCategory,
    label: 'II - Ensino Fundamental 1º-3º ano',
    maxParticipants: 5,
    ageRange: '1º-3º ano'
  },
  {
    value: 'III' as ProjectCategory,
    label: 'III - Ensino Fundamental 4º-6º ano',
    maxParticipants: 5,
    ageRange: '4º-6º ano'
  },
  {
    value: 'IV' as ProjectCategory,
    label: 'IV - Ensino Fundamental 7º-9º ano',
    maxParticipants: 3,
    ageRange: '7º-9º ano'
  },
  {
    value: 'V' as ProjectCategory,
    label: 'V - Ensino Médio',
    maxParticipants: 3,
    ageRange: 'Ensino Médio'
  },
  {
    value: 'VI' as ProjectCategory,
    label: 'VI - Educação de Jovens e Adultos (EJA)',
    maxParticipants: 3,
    ageRange: 'EJA'
  },
  {
    value: 'VII' as ProjectCategory,
    label: 'VII - Técnico',
    maxParticipants: 3,
    ageRange: 'Técnico'
  },
  {
    value: 'VIII' as ProjectCategory,
    label: 'VIII - Ensino Superior',
    maxParticipants: 3,
    ageRange: 'Superior'
  },
  {
    value: 'IX' as ProjectCategory,
    label: 'IX - Pós-graduação',
    maxParticipants: 3,
    ageRange: 'Pós-graduação'
  },
  {
    value: 'RELATO' as ProjectCategory,
    label: 'RELATO - Experiência Científico-Pedagógica',
    maxParticipants: 5,
    ageRange: 'Educadores'
  }
];

export const PROJECT_STATUS = [
  { value: 'RASCUNHO', label: 'Rascunho', color: 'gray' },
  { value: 'SUBMETIDO', label: 'Submetido', color: 'blue' },
  { value: 'EM_ANALISE_CIAS', label: 'Em Análise CIAS', color: 'yellow' },
  { value: 'APROVADO_CIAS', label: 'Aprovado CIAS', color: 'green' },
  { value: 'REPROVADO_CIAS', label: 'Reprovado CIAS', color: 'red' },
  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pagamento', color: 'yellow' },
  { value: 'CONFIRMADO_VIRTUAL', label: 'Confirmado Virtual', color: 'blue' },
  { value: 'FINALISTA_PRESENCIAL', label: 'Finalista Presencial', color: 'purple' },
  { value: 'PREMIADO', label: 'Premiado', color: 'green' },
  { value: 'ARQUIVADO', label: 'Arquivado', color: 'gray' }
] as const;

export const PROJECT_STATUS_INFO: Record<ProjectStatus, {
  label: string;
  description: string;
  color: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}> = {
  'RASCUNHO': {
    label: 'Rascunho',
    description: 'Projeto em elaboração',
    color: 'gray'
  },
  'SUBMETIDO': {
    label: 'Submetido',
    description: 'Enviado para avaliação',
    color: 'blue'
  },
  'EM_ANALISE_CIAS': {
    label: 'Em Análise CIAS',
    description: 'Sendo avaliado pelo CIAS',
    color: 'blue'
  },
  'APROVADO_CIAS': {
    label: 'Aprovado CIAS',
    description: 'Aprovado pelo CIAS',
    color: 'green'
  },
  'REPROVADO_CIAS': {
    label: 'Reprovado CIAS',
    description: 'Reprovado pelo CIAS',
    color: 'red'
  },
  'AGUARDANDO_PAGAMENTO': {
    label: 'Aguardando Pagamento',
    description: 'Aguardando confirmação de pagamento',
    color: 'yellow'
  },
  'CONFIRMADO_VIRTUAL': {
    label: 'Confirmado Virtual',
    description: 'Participação virtual confirmada',
    color: 'blue'
  },
  'FINALISTA_PRESENCIAL': {
    label: 'Finalista Presencial',
    description: 'Classificado para fase presencial',
    color: 'green'
  },
  'PREMIADO': {
    label: 'Premiado',
    description: 'Projeto premiado',
    color: 'yellow'
  },
  'ARQUIVADO': {
    label: 'Arquivado',
    description: 'Projeto arquivado',
    color: 'gray'
  }
};

export const CATEGORY_INFO = PROJECT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.value] = {
    label: cat.label,
    description: cat.ageRange,
    maxParticipants: cat.maxParticipants
  };
  return acc;
}, {} as Record<ProjectCategory, { label: string; description: string; maxParticipants: number; }>);

// ===== UTILITÁRIOS =====

export const getProjectCategoryInfo = (category: ProjectCategory) => {
  return PROJECT_CATEGORIES.find(c => c.value === category);
};

export const getProjectStatusInfo = (status: ProjectStatus) => {
  return PROJECT_STATUS_INFO[status];
};

export const canEditProject = (project: Project, userId?: string) => {
  const isOwner = project.ownerId === userId;
  return isOwner && ['RASCUNHO', 'SUBMETIDO'].includes(project.status);
};

export const canDeleteProject = (project: Project, userId?: string) => {
  return project.ownerId === userId && project.status === 'RASCUNHO';
};

export const canSubmitProject = (project: Project, userId?: string) => {
  const isOwner = project.ownerId === userId;
  return isOwner && project.status === 'RASCUNHO';
};

// ✨ NOVO: Verificar se projeto foi credenciado por feira
export const isProjetoCredenciado = (project: Project): boolean => {
  return !!project.feiraAfiliadaId;
};