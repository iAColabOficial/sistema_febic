import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser) as User);
      } catch (error) {
        console.error('Erro ao recuperar dados salvos:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    setLoading(true);
    
    const response = await authService.login({ email, password });
    
    if (response.success && response.data) {
      const { user: userData, token: userToken } = response.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // SÓ definir user em caso de sucesso
      setUser(userData);
      setToken(userToken);
      
      toast.success(`Bem-vindo(a)!`);
      return true;
    } else {
      // NÃO mexer no state user em caso de falha
      return false;
    }
  } catch (error: any) {
    console.error('Erro no login:', error);
      
      // Verificar o tipo de erro e NÃO mostrar toast genérico
      if (error.response?.status === 401) {
        console.log('Credenciais inválidas (401)');
      } else if (error.response?.status === 404) {
        console.log('Usuário não encontrado (404)');
      } else {
        console.log('Erro de conexão ou servidor');
      }
      
      // NÃO mostrar toast - deixar o Login.tsx cuidar da UI
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    toast.success('Logout realizado com sucesso');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};