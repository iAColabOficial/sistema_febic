
// frontend/src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se não há restrição de roles, permite acesso
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Verifica se o usuário tem um dos roles permitidos
  const hasRequiredRole = allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    // Redireciona para o dashboard apropriado baseado no role do usuário
    const dashboardRoutes: Record<string, string> = {
      'ADMINISTRADOR': '/dashboard/admin',
      'AUTOR': '/dashboard/author',
      'ORIENTADOR': '/dashboard/orientador',
      'AVALIADOR': '/dashboard/evaluator'
    };

    const redirectTo = dashboardRoutes[user.role] || '/login';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;