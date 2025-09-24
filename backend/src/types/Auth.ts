
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  cpf: string;
  name: string;
  phone?: string;
  password: string;
}

export interface JWTUser {
  userId: number;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTUser;
}