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
  const [projects, setProjects] = useState<Project[]>([]); // âœ… Array vazio, nÃ£o undefined
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
      // âœ… Garantir que sempre seja um array
      const projectsData = response.data.data?.projects || response.data.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    }
  } catch (error: any) {
    console.error('Erro ao buscar projetos:', error);
    toast.error(error.response?.data?.message || 'Erro ao carregar projetos');
    setProjects([]); // âœ… Sempre array vazio em caso de erro
  } finally {
    setLoading(false);
  }
}, [filters]);

  // ===== BUSCAR PROJETO POR ID =====
  const getProject = async (id: string): Promise<Project | null> => {  // âœ… Corrigido para string (CUID)
    try {
      const response = await api.get(`/projects/${id}`);  // âœ… Removido /api/
      
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
      const newProject: Project = response.data.data; // âœ… Corrigido
      
      // âœ… VersÃ£o mais segura: sÃ³ atualizar a lista se estivermos na primeira pÃ¡gina
      if (pagination?.page === 1) {
        setProjects(prev => {
          const limit = pagination?.limit || 10;
          return [newProject, ...prev.slice(0, Math.max(0, limit - 1))];
        });
      } else {
        // Se nÃ£o estiver na primeira pÃ¡gina, apenas refetch para garantir consistÃªncia
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
      // Em vez de atualizar localmente, refaÃ§a a busca
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
  const deleteProject = async (id: string): Promise<boolean> => {  // âœ… Corrigido para string
    try {
      const response = await api.delete(`/projects/${id}`);  // âœ… Removido /api/
      
      if (response.data.success) {
        // Remover da lista
        setProjects(prev => prev.filter(p => p.id !== id));
        
        toast.success('Projeto excluÃ­do com sucesso!');
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
  const submitProject = async (id: string): Promise<boolean> => {  // âœ… Corrigido para string
    try {
      const response = await api.post(`/projects/${id}/submit`);  // âœ… Removido /api/
      
      if (response.data.success) {
        const updatedProject: Project = response.data.data;
        
        // Atualizar na lista
        setProjects(prev => 
          prev.map(p => p.id === id ? updatedProject : p)
        );
        
        toast.success('Projeto enviado para avaliaÃ§Ã£o!');
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
  const updateProjectStatus = async (id: string, status: string): Promise<boolean> => {  // âœ… Corrigido para string
    try {
      const response = await api.put(`/projects/${id}/status`, { status });  // âœ… Removido /api/
      
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

  // ===== MUDAR PÃGINA =====
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
    
    // AÃ§Ãµes
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

// ===== HOOK PARA ESTATÃSTICAS =====
export const useProjectStats = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
  try {
    setLoading(true);
    const response = await api.get('/projects/stats');
    
    if (response.data.success) {
      setStats(response.data.data); // âœ… Corrigido: remover .stats
    }
  } catch (error: any) {
    console.error('Erro ao buscar estatÃ­sticas:', error);
    toast.error('Erro ao carregar estatÃ­sticas');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};

// ===== HOOK PARA ÃREAS DO CONHECIMENTO =====
export const useAreasConhecimento = (nivel?: number, parent?: string) => {
  const [areas, setAreas] = useState<AreaConhecimento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (nivel) params.nivel = nivel;
      if (parent) params.parent = parent;

      const response = await api.get('/projects/areas', { params });  // âœ… Corrigido para /projects/areas
      
      if (response.data.success) {
        setAreas(response.data.data);
      }
    } catch (error: any) {
      console.error('Erro ao buscar Ã¡reas do conhecimento:', error);
      toast.error('Erro ao carregar Ã¡reas do conhecimento');
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