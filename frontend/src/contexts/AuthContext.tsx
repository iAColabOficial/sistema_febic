// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import toast from 'react-hot-toast';

type UserRole = 
  | 'ADMINISTRADOR'
  | 'AUTOR'
  | 'AVALIADOR'
  | 'ORIENTADOR'
  | 'FEIRA_AFILIADA'
  | 'FINANCEIRO'
  | 'COORDENADOR_AVALIACOES';
  
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: string[]; // Array de roles para dual role
  isDualRole?: boolean;
  isOrientador?: boolean;
  isAvaliador?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  refreshUserInfo: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
        
        // Configurar token no axios para futuras requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (error) {
        console.error('Erro ao recuperar dados salvos:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const refreshUserInfo = async () => {
    try {
      const response = await api.get('/users/me/role-info');
      
      if (response.data.success) {
        const roleInfo = response.data.data;
        
        const updatedUser: User = {
          id: roleInfo.userId,
          name: roleInfo.name,
          email: roleInfo.email,
          role: roleInfo.primaryRole,
          roles: roleInfo.roles,
          isDualRole: roleInfo.isDualRole,
          isOrientador: roleInfo.isOrientador,
          isAvaliador: roleInfo.isAvaliador
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erro ao atualizar informações do usuário:', error);
      // Não fazer nada em caso de erro - manter o usuário atual
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        
        localStorage.setItem('token', userToken);
        
        // Configurar token no axios
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        setToken(userToken);
        
        // Buscar informações completas do usuário (incluindo dual role)
        try {
          const roleResponse = await api.get('/users/me/role-info');
          
          if (roleResponse.data.success) {
            const roleInfo = roleResponse.data.data;
            
            const userWithRoles: User = {
              id: roleInfo.userId,
              name: roleInfo.name,
              email: roleInfo.email,
              role: roleInfo.primaryRole,
              roles: roleInfo.roles,
              isDualRole: roleInfo.isDualRole,
              isOrientador: roleInfo.isOrientador,
              isAvaliador: roleInfo.isAvaliador
            };
            
            setUser(userWithRoles);
            localStorage.setItem('user', JSON.stringify(userWithRoles));
          } else {
            // Fallback para userData básico se a busca de role info falhar
            const basicUser: User = {
              id: userData.userId || userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role
            };
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
          }
        } catch (roleError) {
          console.error('Erro ao buscar role info:', roleError);
          // Fallback para userData básico
          const basicUser: User = {
            id: userData.userId || userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          };
          setUser(basicUser);
          localStorage.setItem('user', JSON.stringify(basicUser));
        }
        
        toast.success(`Bem-vindo(a)!`);
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      if (error.response?.status === 401) {
        console.log('Credenciais inválidas (401)');
      } else if (error.response?.status === 404) {
        console.log('Usuário não encontrado (404)');
      } else {
        console.log('Erro de conexão ou servidor');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logout realizado com sucesso');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    refreshUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};