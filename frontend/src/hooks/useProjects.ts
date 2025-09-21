import { useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  CreateProjectData, 
  UpdateProjectData, 
  ProjectFilters, 
  ProjectsListResponse, 
  ProjectStats,
  AreaConhecimento 
} from '../types/Project';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useProjects = (initialFilters?: ProjectFilters) => {
  const [projects, setProjects] = useState<Project[]>([]); // ✅ Array vazio, não undefined
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<ProjectFilters>(initialFilters || {});

  // ===== BUSCAR PROJETOS =====
  const fetchProjects = useCallback(async (newFilters?: ProjectFilters) => {
  try {
    setLoading(true);
    
    const queryParams = { ...filters, ...newFilters };
    const cleanParams = Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const response = await api.get('/projects', { params: cleanParams });
    
    if (response.data.success) {
      // ✅ Garantir que sempre seja um array
      const projectsData = response.data.data?.projects || response.data.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    }
  } catch (error: any) {
    console.error('Erro ao buscar projetos:', error);
    toast.error(error.response?.data?.message || 'Erro ao carregar projetos');
    setProjects([]); // ✅ Sempre array vazio em caso de erro
  } finally {
    setLoading(false);
  }
}, [filters]);

  // ===== BUSCAR PROJETO POR ID =====
  const getProject = async (id: string): Promise<Project | null> => {  // ✅ Corrigido para string (CUID)
    try {
      const response = await api.get(`/projects/${id}`);  // ✅ Removido /api/
      
      if (response.data.success) {
        return response.data.data;;
      }
      return null;
    } catch (error: any) {
      console.error('Erro ao buscar projeto:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao carregar projeto'
      );
      return null;
    }
  };

  // ===== CRIAR PROJETO =====
const createProject = async (data: CreateProjectData): Promise<Project | null> => {
  try {
    const response = await api.post('/projects', data);
    
    if (response.data.success) {
      const newProject: Project = response.data.data; // ✅ Corrigido
      
      // ✅ Versão mais segura: só atualizar a lista se estivermos na primeira página
      if (pagination?.page === 1) {
        setProjects(prev => {
          const limit = pagination?.limit || 10;
          return [newProject, ...prev.slice(0, Math.max(0, limit - 1))];
        });
      } else {
        // Se não estiver na primeira página, apenas refetch para garantir consistência
        fetchProjects();
      }
      
      toast.success('Projeto criado com sucesso!');
      return newProject;
    }
    return null;
  } catch (error: any) {
    console.error('Erro ao criar projeto:', error);
    toast.error(
      error.response?.data?.message || 'Erro ao criar projeto'
    );
    return null;
  }
};

  // ===== ATUALIZAR PROJETO =====
const updateProject = async (id: string, data: UpdateProjectData): Promise<boolean> => {
  try {
    const response = await api.put(`/projects/${id}`, data);
    
    if (response.data.success) {
      // Em vez de atualizar localmente, refaça a busca
      await fetchProjects();
      
      toast.success('Projeto atualizado com sucesso!');
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Erro ao atualizar projeto:', error);
    toast.error(error.response?.data?.message || 'Erro ao atualizar projeto');
    return false;
  }
};
  // ===== EXCLUIR PROJETO =====
  const deleteProject = async (id: string): Promise<boolean> => {  // ✅ Corrigido para string
    try {
      const response = await api.delete(`/projects/${id}`);  // ✅ Removido /api/
      
      if (response.data.success) {
        // Remover da lista
        setProjects(prev => prev.filter(p => p.id !== id));
        
        toast.success('Projeto excluído com sucesso!');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro ao excluir projeto:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao excluir projeto'
      );
      return false;
    }
  };

  // ===== ENVIAR PROJETO =====
  const submitProject = async (id: string): Promise<boolean> => {  // ✅ Corrigido para string
    try {
      const response = await api.post(`/projects/${id}/submit`);  // ✅ Removido /api/
      
      if (response.data.success) {
        const updatedProject: Project = response.data.data;
        
        // Atualizar na lista
        setProjects(prev => 
          prev.map(p => p.id === id ? updatedProject : p)
        );
        
        toast.success('Projeto enviado para avaliação!');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro ao enviar projeto:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao enviar projeto'
      );
      return false;
    }
  };

  // ===== ATUALIZAR STATUS (ADMIN) =====
  const updateProjectStatus = async (id: string, status: string): Promise<boolean> => {  // ✅ Corrigido para string
    try {
      const response = await api.put(`/projects/${id}/status`, { status });  // ✅ Removido /api/
      
      if (response.data.success) {
        const updatedProject: Project = response.data.data;
        
        // Atualizar na lista
        setProjects(prev => 
          prev.map(p => p.id === id ? updatedProject : p)
        );
        
        const statusLabel = status === 'SELECIONADO' ? 'aprovado' : 
                           status === 'DESCLASSIFICADO' ? 'rejeitado' : 'atualizado';
        toast.success(`Projeto ${statusLabel} com sucesso!`);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao atualizar status'
      );
      return false;
    }
  };

  // ===== APLICAR FILTROS =====
  const applyFilters = (newFilters: ProjectFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchProjects(updatedFilters);
  };

  // ===== MUDAR PÁGINA =====
  const changePage = (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    fetchProjects(updatedFilters);
  };

  // ===== RECARREGAR =====
  const refetch = () => {
    fetchProjects();
  };

  // ===== EFEITO INICIAL =====
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    // Dados
    projects,
    loading,
    pagination,
    filters,
    
    // Ações
    createProject,
    getProject,
    updateProject,
    deleteProject,
    submitProject,
    updateProjectStatus,
    applyFilters,
    changePage,
    refetch
  };
};

// ===== HOOK PARA ESTATÍSTICAS =====
export const useProjectStats = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
  try {
    setLoading(true);
    const response = await api.get('/projects/stats');
    
    if (response.data.success) {
      setStats(response.data.data); // ✅ Corrigido: remover .stats
    }
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    toast.error('Erro ao carregar estatísticas');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};

// ===== HOOK PARA ÁREAS DO CONHECIMENTO =====
export const useAreasConhecimento = (nivel?: number, parent?: string) => {
  const [areas, setAreas] = useState<AreaConhecimento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (nivel) params.nivel = nivel;
      if (parent) params.parent = parent;

      const response = await api.get('/projects/areas', { params });  // ✅ Corrigido para /projects/areas
      
      if (response.data.success) {
        setAreas(response.data.data);
      }
    } catch (error: any) {
      console.error('Erro ao buscar áreas do conhecimento:', error);
      toast.error('Erro ao carregar áreas do conhecimento');
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [nivel, parent]);

  return { areas, loading, refetch: fetchAreas };
};