
// frontend/src/types/User.ts
export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  AUTOR = 'AUTOR',
  AVALIADOR = 'AVALIADOR',
  ORIENTADOR = 'ORIENTADOR',
  FEIRA_AFILIADA = 'FEIRA_AFILIADA',
  FINANCEIRO = 'FINANCEIRO',
  COORDENADOR_AVALIACOES = 'COORDENADOR_AVALIACOES'  // ← ADICIONAR
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  institution?: string;
  position?: string;
  formation?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  lastLogin?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
}