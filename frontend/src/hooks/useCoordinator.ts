import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface CoordinatorStats {
  totalProjects: number;
  projectsSubmitted: number;
  projectsInReview: number;
  totalEvaluators: number;
  activeEvaluators: number;
  pendingEvaluations: number;
  completedEvaluations: number;
}

interface DistributionReport {
  projectsWithoutEvaluators: number;
  projectsPartiallyDistributed: number;
  projectsFullyDistributed: number;
  evaluatorsWithoutProjects: number;
  averageProjectsPerEvaluator: number;
  evaluatorWorkload: Array<{
    evaluatorId: string;
    evaluatorName: string;
    assignedProjects: number;
    completedEvaluations: number;
    pendingEvaluations: number;
  }>;
}

export const useCoordinator = () => {
  const [stats, setStats] = useState<CoordinatorStats | null>(null);
  const [report, setReport] = useState<DistributionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // ✅ useCallback previne re-criação da função
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/coordinator/dashboard/stats');
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar estatísticas');
      console.error('Erro ao buscar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ useCallback previne re-criação da função
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/coordinator/dashboard/report');
      setReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar relatório');
      console.error('Erro ao buscar relatório:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ useCallback previne re-criação da função
  const refreshData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchReport()]);
  }, [fetchStats, fetchReport]);

  // ✅ Carrega dados APENAS UMA VEZ ao montar o componente
  useEffect(() => {
    if (!hasLoaded) {
      refreshData();
      setHasLoaded(true);
    }
  }, [hasLoaded, refreshData]);

  return {
    stats,
    report,
    loading,
    error,
    refreshData,
    fetchStats,
    fetchReport
  };
};