// frontend/src/hooks/useFeiraAfiliada.ts
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface Feira {
  id: string;
  name: string;
  city: string;
  state: string;
  edition: string;
  year: number;
  startDate: string;
  endDate: string;
  maxProjects: number;
  isActive: boolean;
  _count?: {
    projects: number;
  };
}

interface DashboardData {
  feira: Feira;
  totalCredenciados: number;
  vagasDisponiveis: number;
  porCategoria: Array<{
    category: string;
    _count: number;
  }>;
  porStatus: Array<{
    status: string;
    _count: number;
  }>;
}

interface Projeto {
  id: string;
  title: string;
  category: string;
  institution: string;
  status: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  areaConhecimento: {
    id: string;
    nome: string;
  };
}

export const useFeiraAfiliada = (feiraId?: string) => {
  const [feiras, setFeiras] = useState<Feira[]>([]);
  const [feiraAtual, setFeiraAtual] = useState<Feira | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetosElegiveis, setProjetosElegiveis] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca feiras públicas (para seletor na submissão)
   */
  const loadFeirasPublicas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/feira-afiliada/publicas');
      setFeiras(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar feiras');
      console.error('Erro ao carregar feiras públicas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega dados do dashboard da feira
   */
  const loadDashboard = useCallback(async (id?: string) => {
    const targetId = id || feiraId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/feira-afiliada/${targetId}/dashboard`);
      setDashboard(response.data);
      setFeiraAtual(response.data.feira);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dashboard');
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [feiraId]);

  /**
   * Carrega projetos credenciados pela feira
   */
  const loadProjetosCredenciados = useCallback(async (id?: string) => {
    const targetId = id || feiraId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/feira-afiliada/${targetId}/credenciados`);
      setProjetos(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar projetos');
      console.error('Erro ao carregar projetos credenciados:', err);
    } finally {
      setLoading(false);
    }
  }, [feiraId]);

  /**
   * Busca projetos elegíveis para credenciamento
   */
  const loadProjetosElegiveis = useCallback(async (search?: string, id?: string) => {
    const targetId = id || feiraId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/feira-afiliada/${targetId}/projetos-elegiveis`, {
        params: { search }
      });
      setProjetosElegiveis(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar projetos');
      console.error('Erro ao buscar projetos elegíveis:', err);
    } finally {
      setLoading(false);
    }
  }, [feiraId]);

  /**
   * Credencia um projeto
   */
  const credenciarProjeto = useCallback(async (projectId: string, id?: string) => {
    const targetId = id || feiraId;
    if (!targetId) {
      throw new Error('ID da feira não fornecido');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/feira-afiliada/${targetId}/credenciar/${projectId}`);
      
      // Recarrega dados
      await Promise.all([
        loadDashboard(targetId),
        loadProjetosElegiveis('', targetId)
      ]);

      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao credenciar projeto';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [feiraId, loadDashboard, loadProjetosElegiveis]);

  /**
   * Remove credencial de um projeto
   */
  const removerCredencial = useCallback(async (projectId: string, id?: string) => {
    const targetId = id || feiraId;
    if (!targetId) {
      throw new Error('ID da feira não fornecido');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/feira-afiliada/${targetId}/credenciar/${projectId}`);
      
      // Recarrega dados
      await Promise.all([
        loadDashboard(targetId),
        loadProjetosCredenciados(targetId)
      ]);

      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao remover credencial';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [feiraId, loadDashboard, loadProjetosCredenciados]);

  /**
   * Busca a feira do usuário logado
   */
  const loadMinhaFeira = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/me');
      const feira = response.data.managedFeiras?.[0];
      
      if (feira) {
        setFeiraAtual(feira);
        return feira;
      }
      
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar feira');
      console.error('Erro ao buscar feira do usuário:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estados
    feiras,
    feiraAtual,
    dashboard,
    projetos,
    projetosElegiveis,
    loading,
    error,

    // Funções
    loadFeirasPublicas,
    loadDashboard,
    loadProjetosCredenciados,
    loadProjetosElegiveis,
    credenciarProjeto,
    removerCredencial,
    loadMinhaFeira,
    setError
  };
};