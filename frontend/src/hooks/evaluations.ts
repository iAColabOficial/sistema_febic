import { useState, useEffect } from 'react';
import api from '../services/api';
import { ProjectEvaluation, CategoryCriteria, CreateEvaluationData } from '../types/Project';

interface UseEvaluationsResult {
  evaluations: ProjectEvaluation[];
  availableProjects: any[];
  stats: any;
  loading: boolean;
  error: string | null;
  createEvaluation: (data: CreateEvaluationData) => Promise<void>;
  updateEvaluation: (id: string, data: CreateEvaluationData) => Promise<void>;
  fetchAvailableProjects: () => Promise<void>;
  fetchMyEvaluations: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useEvaluations = (): UseEvaluationsResult => {
  const [evaluations, setEvaluations] = useState<ProjectEvaluation[]>([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/evaluations/available-projects');
      if (response.data.success) {
        setAvailableProjects(response.data.data.projects || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar projetos');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvaluations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/evaluations/my-evaluations');
      if (response.data.success) {
        setEvaluations(response.data.data.evaluations || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/evaluations/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar estatísticas');
    }
  };

  const createEvaluation = async (data: CreateEvaluationData) => {
    try {
      setLoading(true);
      const response = await api.post('/evaluations', data);
      if (response.data.success) {
        await fetchMyEvaluations();
        await fetchAvailableProjects();
        await fetchStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar avaliação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvaluation = async (id: string, data: CreateEvaluationData) => {
    try {
      setLoading(true);
      const response = await api.put(`/evaluations/${id}`, data);
      if (response.data.success) {
        await fetchMyEvaluations();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar avaliação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    evaluations,
    availableProjects,
    stats,
    loading,
    error,
    createEvaluation,
    updateEvaluation,
    fetchAvailableProjects,
    fetchMyEvaluations,
    fetchStats
  };
};