
export interface User {
  id: number;
  email: string;
  cpf: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'AUTHOR';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  cpf: string;
  name: string;
  phone?: string;
  password: string;
  role?: 'ADMIN' | 'AUTHOR';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
  refreshToken: string;
}