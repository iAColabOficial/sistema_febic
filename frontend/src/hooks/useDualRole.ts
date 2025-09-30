// frontend/src/hooks/useDualRole.ts
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface RoleInfo {
  userId: string;
  email: string;
  name: string;
  primaryRole: string;
  roles: string[];
  isDualRole: boolean;
  isOrientador: boolean;
  isAvaliador: boolean;
  stats: {
    ownedProjects: number;
    evaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
  };
  evaluatorApplication: {
    id: string;
    status: 'PENDENTE' | 'APROVADA' | 'REPROVADA';
    createdAt: string;
    adminNotes?: string;
  } | null;
}

export const useDualRole = () => {
  const { user } = useAuth();
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoleInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/users/me/role-info');
      
      if (response.data.success) {
        setRoleInfo(response.data.data);
      }
    } catch (err: any) {
      console.error('Erro ao buscar informações de role:', err);
      setError(err.response?.data?.message || 'Erro ao buscar informações de role');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRoleInfo();
    }
  }, [user]);

  const hasRole = (role: string): boolean => {
    return roleInfo?.roles.includes(role) || false;
  };

  const isDualRole = (): boolean => {
    return roleInfo?.isDualRole || false;
  };

  const isOrientador = (): boolean => {
    return roleInfo?.isOrientador || false;
  };

  const isAvaliador = (): boolean => {
    return roleInfo?.isAvaliador || false;
  };

  const canAccessOrientadorFeatures = (): boolean => {
    return isOrientador() || hasRole('ADMINISTRADOR');
  };

  const canAccessAvaliadorFeatures = (): boolean => {
    return isAvaliador() || hasRole('ADMINISTRADOR');
  };

  const getPrimaryRole = (): string => {
    return roleInfo?.primaryRole || '';
  };

  const getAllRoles = (): string[] => {
    return roleInfo?.roles || [];
  };

  const getStats = () => {
    return roleInfo?.stats || {
      ownedProjects: 0,
      evaluations: 0,
      completedEvaluations: 0,
      pendingEvaluations: 0
    };
  };

  const hasApprovedEvaluatorApplication = (): boolean => {
    return roleInfo?.evaluatorApplication?.status === 'APROVADA';
  };

  const hasPendingEvaluatorApplication = (): boolean => {
    return roleInfo?.evaluatorApplication?.status === 'PENDENTE';
  };

  const canApplyForEvaluator = (): boolean => {
    return (
      isOrientador() &&
      !isAvaliador() &&
      !roleInfo?.evaluatorApplication
    );
  };

  return {
    roleInfo,
    loading,
    error,
    refresh: fetchRoleInfo,
    
    // Role checks
    hasRole,
    isDualRole,
    isOrientador,
    isAvaliador,
    canAccessOrientadorFeatures,
    canAccessAvaliadorFeatures,
    
    // Role info
    getPrimaryRole,
    getAllRoles,
    getStats,
    
    // Evaluator application
    hasApprovedEvaluatorApplication,
    hasPendingEvaluatorApplication,
    canApplyForEvaluator
  };
};

export default useDualRole;