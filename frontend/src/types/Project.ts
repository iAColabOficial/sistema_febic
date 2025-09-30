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
  id: string; // âœ… string (CUID) - CORRIGIDO: agora Ã© string, nÃ£o number
  title: string; // âœ… title (nÃ£o titulo)
  summary: string; // âœ… summary (nÃ£o resumo)
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
  projectId: string; // âœ… CORRIGIDO: string ao invÃ©s de number
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
  projectId: string; // âœ… CORRIGIDO: string ao invÃ©s de number
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
  projectId: string; // âœ… CORRIGIDO: string ao invÃ©s de number
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
  sigla: string; // âœ… Corrigido
  nome: string;
  nivel: number;
  paiId?: string; // âœ… Corrigido
}

// ===== FORMULÃRIOS =====

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
  // Dados bÃ¡sicos
  title: string;
  summary: string;
  objective: string;
  methodology: string;
  results?: string;
  conclusion?: string;
  bibliography?: string;
  
  // Categoria e Ã¡rea
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
  
  // Integrantes e orientadores
  members: ProjectMember[];
  orientadores: ProjectOrientador[];
  
  // Dados financeiros
  paymentRequired: boolean;
  isPaymentExempt: boolean;
  exemptionReason?: string;
}

// âœ… ADICIONADA: Interface que estava sendo importada mas nÃ£o existia
export interface CreateProjectRequest extends CreateProjectData {}

export interface UpdateProjectData {
  title?: string; // âœ… CORRIGIDO: title ao invÃ©s de titulo
  category?: ProjectCategory; // âœ… CORRIGIDO: category ao invÃ©s de categoria
  areaConhecimentoId?: string;
  summary?: string; // âœ… CORRIGIDO: summary ao invÃ©s de resumo
  keywords?: string;
  institution?: string; // âœ… CORRIGIDO: institution ao invÃ©s de institutionName
  institutionState?: string;
  institutionCity?: string;
  isPublicSchool?: boolean; // âœ… CORRIGIDO: isPublicSchool ao invÃ©s de isPublicInstitution
  isFullTimeInstitution?: boolean;
}

// ===== FILTROS =====

export interface ProjectFilters {
  search?: string;
  category?: ProjectCategory; // âœ… CORRIGIDO: category ao invÃ©s de categoria
  status?: ProjectStatus;
  areaConhecimentoId?: string;
  isCredenciado?: boolean;
  institutionState?: string;
  createdBy?: number;
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

// ===== CONFIGURAÃ‡Ã•ES POR CATEGORIA =====

export const PROJECT_CATEGORIES = [
  {
    value: 'I' as ProjectCategory,
    label: 'I - EducaÃ§Ã£o Infantil (3-6 anos)',
    maxParticipants: 6,
    ageRange: '3-6 anos'
  },
  {
    value: 'II' as ProjectCategory,
    label: 'II - Ensino Fundamental 1Âº-3Âº ano',
    maxParticipants: 5,
    ageRange: '1Âº-3Âº ano'
  },
  {
    value: 'III' as ProjectCategory,
    label: 'III - Ensino Fundamental 4Âº-6Âº ano',
    maxParticipants: 5,
    ageRange: '4Âº-6Âº ano'
  },
  {
    value: 'IV' as ProjectCategory,
    label: 'IV - Ensino Fundamental 7Âº-9Âº ano',
    maxParticipants: 3,
    ageRange: '7Âº-9Âº ano'
  },
  {
    value: 'V' as ProjectCategory,
    label: 'V - Ensino MÃ©dio',
    maxParticipants: 3,
    ageRange: 'Ensino MÃ©dio'
  },
  {
    value: 'VI' as ProjectCategory,
    label: 'VI - EducaÃ§Ã£o de Jovens e Adultos (EJA)',
    maxParticipants: 3,
    ageRange: 'EJA'
  },
  {
    value: 'VII' as ProjectCategory,
    label: 'VII - TÃ©cnico',
    maxParticipants: 3,
    ageRange: 'TÃ©cnico'
  },
  {
    value: 'VIII' as ProjectCategory,
    label: 'VIII - Ensino Superior',
    maxParticipants: 3,
    ageRange: 'Superior'
  },
  {
    value: 'IX' as ProjectCategory,
    label: 'IX - PÃ³s-graduaÃ§Ã£o',
    maxParticipants: 3,
    ageRange: 'PÃ³s-graduaÃ§Ã£o'
  },
  {
    value: 'RELATO' as ProjectCategory,
    label: 'RELATO - ExperiÃªncia CientÃ­fico-PedagÃ³gica',
    maxParticipants: 5,
    ageRange: 'Educadores'
  }
];

export const PROJECT_STATUS = [
  { value: 'RASCUNHO', label: 'Rascunho', color: 'gray' },
  { value: 'SUBMETIDO', label: 'Submetido', color: 'blue' },
  { value: 'EM_ANALISE_CIAS', label: 'Em AnÃ¡lise CIAS', color: 'yellow' },
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
    description: 'Projeto em elaboraÃ§Ã£o',
    color: 'gray'
  },
  'SUBMETIDO': {
    label: 'Submetido',
    description: 'Enviado para avaliaÃ§Ã£o',
    color: 'blue'
  },
  'EM_ANALISE_CIAS': {
    label: 'Em AnÃ¡lise CIAS',
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
    description: 'Aguardando confirmaÃ§Ã£o de pagamento',
    color: 'yellow'
  },
  'CONFIRMADO_VIRTUAL': {
    label: 'Confirmado Virtual',
    description: 'ParticipaÃ§Ã£o virtual confirmada',
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

// âœ… ADICIONADA: Constante que estava sendo importada mas nÃ£o existia
export const CATEGORY_INFO = PROJECT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.value] = {
    label: cat.label,
    description: cat.ageRange,
    maxParticipants: cat.maxParticipants
  };
  return acc;
}, {} as Record<ProjectCategory, { label: string; description: string; maxParticipants: number; }>);

// ===== UTILITÃRIOS =====

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