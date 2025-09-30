// AdminDashboard.tsx (VERSÃO ATUALIZADA COM GESTÃO DE AVALIAÇÕES)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects, useProjectStats } from '../../hooks/useProjects';
import { 
  Users, FileText, CheckCircle, Clock, LogOut, Eye, BarChart3, 
  AlertTriangle, TrendingUp, Calendar, Filter, Search, ArrowRight,
  UserCheck, UserX, Star, Award, DollarSign, Bell, Edit3, Trash2,
  Plus, MoreVertical, RefreshCw, Settings, Shield, ClipboardList, // NOVO ÍCONE
  Play, UserPlus, Target, Activity // NOVOS ÍCONES
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project, getProjectStatusInfo } from '../../types/Project';
import api from '../../services/api';
import EditUserModal from './EditUserModal';
import EditProjectModal from './EditProjectModal';
import CreateUserModal from './CreateUserModal';


// Interfaces existentes...
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  cpf?: string;
  phone?: string;
  city?: string;
  state?: string;
  institution?: string;
  _count?: {
    projects?: number;
    participations?: number;
  };
  ownedProjects?: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

interface RecentActivity {
  id: string;
  type: 'project_created' | 'project_submitted' | 'user_registered' | 'project_approved';
  description: string;
  user: string;
  timestamp: string;
  projectId?: string;
  userId?: string;
}

interface AdminStats {
  users: {
    total: number;
    byRole: Record<string, number>;
    recentActivity: number;
  };
  projects: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    recentActivity: number;
  };
}

// NOVA INTERFACE para estatísticas de avaliação
interface EvaluationStats {
  totalProjects: number;
  projectsWithEvaluators: number;
  projectsWithoutEvaluators: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  totalEvaluators: number;
  evaluationProgress: number;
  completionRate: number;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading } = useProjectStats();
  const navigate = useNavigate();

  // Estados para dados
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [evaluationStats, setEvaluationStats] = useState<EvaluationStats | null>(null); // NOVO ESTADO
  const [loading, setLoading] = useState(false);
  
  // Estados para modais e ações
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Estados para filtros e busca
  const [userFilter, setUserFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'dashboard' | 'users' | 'projects' | 'evaluations'>('dashboard'); 
  const [evaluationFilter, setEvaluationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showManualDistribution, setShowManualDistribution] = useState(false);

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchAdminData();
    // NOVO: Buscar estatísticas de avaliação
    if (viewMode === 'evaluations' || viewMode === 'dashboard') {
      fetchEvaluationStats();
    }
  }, [viewMode]);

  // Buscar todos os dados administrativos
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const [
        usersResponse, 
        projectsResponse, 
        pendingResponse, 
        activitiesResponse,
        statsResponse
      ] = await Promise.all([
        api.get('/admin/users', { params: { limit: 20 } }),
        api.get('/admin/projects', { params: { limit: 20 } }),
        api.get('/projects', { params: { status: 'SUBMETIDO', limit: 10 } }),
        api.get('/admin/activities'),
        api.get('/admin/stats')
      ]);

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data || []);
      }

      if (projectsResponse.data.success) {
        setProjects(projectsResponse.data.data || []);
      }

      if (pendingResponse.data.success) {
        setPendingProjects(pendingResponse.data.data?.projects || pendingResponse.data.data || []);
      }

      if (activitiesResponse.data.success) {
        setRecentActivities(activitiesResponse.data.data || []);
      }

      if (statsResponse.data.success) {
        setAdminStats(statsResponse.data.data);
      }

    } catch (error) {
      console.error('Erro ao buscar dados administrativos:', error);
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNÇÃO: Buscar estatísticas de avaliação
  const fetchEvaluationStats = async () => {
    try {
      const response = await api.get('/evaluations/admin/stats');
      if (response.data) {
        setEvaluationStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de avaliação:', error);
    }
  };
  // NOVAS FUNÇÕES para gestão de avaliações
const handleDistributeAll = async () => {
  if (!confirm('Deseja executar a distribuição automática de avaliadores para todos os projetos?')) return;
  
  try {
    setLoading(true);
    const response = await api.post('/evaluations/distribute/all');
    if (response.data.success) {
      alert(`Distribuição concluída! ${response.data.distributed} projetos receberam avaliadores.`);
      await fetchEvaluationStats();
      await fetchAdminData();
    }
  } catch (error: any) {
    console.error('Erro na distribuição automática:', error);
    alert(error.response?.data?.message || 'Erro ao distribuir avaliadores');
  } finally {
    setLoading(false);
  }
};

const handleBulkDistribute = async () => {
  if (selectedProjects.length === 0) {
    alert('Selecione pelo menos um projeto');
    return;
  }
  
  if (!confirm(`Distribuir avaliadores para ${selectedProjects.length} projeto(s)?`)) return;
  
  try {
    setLoading(true);
    let successCount = 0;
    
    for (const projectId of selectedProjects) {
      try {
        await api.post(`/evaluations/distribute/project/${projectId}`);
        successCount++;
      } catch (error) {
        console.error(`Erro ao distribuir para projeto ${projectId}:`, error);
      }
    }
    
    alert(`Distribuição concluída! ${successCount} de ${selectedProjects.length} projetos receberam avaliadores.`);
    setSelectedProjects([]);
    await fetchEvaluationStats();
    await fetchAdminData();
  } catch (error) {
    console.error('Erro na distribuição em lote:', error);
    alert('Erro durante a distribuição em lote');
  } finally {
    setLoading(false);
  }
};

const handleViewEvaluations = (projectId: string) => {
  navigate(`/admin/projects/${projectId}/evaluations`);
};

const handleManualAssign = async (projectId: string) => {
  try {
    const response = await api.get(`/evaluations/admin/projects/${projectId}/available-evaluators`);
    if (response.data.success) {
      console.log('Avaliadores disponíveis:', response.data.data);
      alert('Modal de atribuição manual será implementado na próxima versão');
    }
  } catch (error) {
    console.error('Erro ao buscar avaliadores disponíveis:', error);
    alert('Erro ao buscar avaliadores disponíveis');
  }
};
  // Funções para gestão de usuários (mantidas iguais)
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleSaveUser = async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowEditUserModal(false);
    await fetchAdminData();
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!confirm(`Tem certeza que deseja deletar o usuário "${user?.name}"? Esta ação não pode ser desfeita.`)) return;
    
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert('Usuário deletado com sucesso');
      }
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      alert(error.response?.data?.message || 'Erro ao deletar usuário');
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPassword = prompt(`Digite a nova senha para ${userName} (mínimo 6 caracteres):`);
    if (!newPassword || newPassword.length < 6) {
      alert('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (!confirm(`Confirma o reset da senha para ${userName}?`)) return;
    
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`, {
        newPassword
      });
      if (response.data.success) {
        alert(`Senha resetada com sucesso para ${userName}`);
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      alert('Erro ao resetar senha');
    }
  };

  // Funções para gestão de projetos (mantidas iguais)
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditProjectModal(true);
  };

  const handleSaveProject = async (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setPendingProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setShowEditProjectModal(false);
    await fetchAdminData();
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!confirm(`Tem certeza que deseja deletar o projeto "${project?.title}"? Esta ação não pode ser desfeita e removerá todos os dados associados.`)) return;
    
    try {
      const response = await api.delete(`/admin/projects/${projectId}`);
      if (response.data.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setPendingProjects(prev => prev.filter(p => p.id !== projectId));
        alert('Projeto deletado com sucesso');
      }
    } catch (error: any) {
      console.error('Erro ao deletar projeto:', error);
      alert(error.response?.data?.message || 'Erro ao deletar projeto');
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedProjects.length === 0) {
      alert('Selecione pelo menos um projeto');
      return;
    }
    
    if (!confirm(`Alterar status de ${selectedProjects.length} projeto(s) para ${getProjectStatusInfo(status as any)?.label}?`)) return;
    
    try {
      const response = await api.post('/admin/projects/bulk-status', {
        projectIds: selectedProjects,
        status
      });
      
      if (response.data.success) {
        alert(response.data.message);
        setSelectedProjects([]);
        await fetchAdminData();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status dos projetos');
    }
  };

  // Funções auxiliares (mantidas iguais)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 dia atrás';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return formatDate(dateString);
  };

  const getStatusColor = (status: string) => {
    const statusInfo = getProjectStatusInfo(status as any);
    const colorMap = {
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colorMap[statusInfo?.color || 'gray'];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'project_submitted': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'user_registered': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'project_approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      'ADMINISTRADOR': 'bg-red-100 text-red-800 border-red-200',
      'AVALIADOR': 'bg-purple-100 text-purple-800 border-purple-200',
      'ORIENTADOR': 'bg-blue-100 text-blue-800 border-blue-200',
      'AUTOR': 'bg-green-100 text-green-800 border-green-200'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Filtrar dados
  const filteredUsers = users.filter(user => {
  const matchesRole = userFilter === 'all' || user.role === userFilter;
  const matchesSearch = !searchTerm || 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesRole && matchesSearch;
});

  const filteredProjects = projects.filter(project => {
  // Filtro básico para views users e projects
  if (viewMode !== 'evaluations') {
    const matchesStatus = projectFilter === 'all' || project.status === projectFilter;
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }
   // Filtros específicos para view de avaliações
  const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
  const matchesSearch = !searchTerm || 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.owner?.name.toLowerCase().includes(searchTerm.toLowerCase());
  
  // Filtro por status de avaliação
  let matchesEvaluationFilter = true;
  if (evaluationFilter === 'with_evaluators') {
    matchesEvaluationFilter = (project.avaliacoes?.length || 0) > 0;
  } else if (evaluationFilter === 'without_evaluators') {
    matchesEvaluationFilter = (project.avaliacoes?.length || 0) === 0;
  } else if (evaluationFilter === 'completed') {
    matchesEvaluationFilter = (project.avaliacoes?.filter(a => a.isCompleted).length || 0) > 0;
  } else if (evaluationFilter === 'pending') {
    matchesEvaluationFilter = (project.avaliacoes?.filter(a => !a.isCompleted).length || 0) > 0;
  }
  
  return matchesCategory && matchesSearch && matchesEvaluationFilter;
});
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard Administrativo
                </h1>
                <p className="text-sm text-gray-500">Gestão completa do sistema FEBIC</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Tabs - ATUALIZADO COM NOVA ABA */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'dashboard' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setViewMode('users')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'users' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Usuários
                </button>
                <button
                  onClick={() => setViewMode('projects')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'projects' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Projetos
                </button>
                {/* NOVA ABA DE AVALIAÇÕES */}
                <button
                  onClick={() => setViewMode('evaluations')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors relative ${
                    viewMode === 'evaluations' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 inline mr-1" />
                  Avaliações
                  {evaluationStats?.projectsWithoutEvaluators && evaluationStats.projectsWithoutEvaluators > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {evaluationStats.projectsWithoutEvaluators}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={fetchAdminData}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors p-2 border border-gray-300 rounded-lg hover:border-red-300"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <>
            {/* Stats Overview - ATUALIZADO COM STATS DE AVALIAÇÃO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg border">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Usuários
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loading ? '...' : adminStats?.users.total || users.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Projetos
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statsLoading ? '...' : adminStats?.projects.total || stats?.total || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pendentes
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statsLoading ? '...' : pendingProjects.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Aprovados
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statsLoading ? '...' : stats?.byStatus.APROVADO_CIAS || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOVOS CARDS DE AVALIAÇÃO */}
              <div className="bg-purple-50 overflow-hidden shadow rounded-lg border border-purple-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClipboardList className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-purple-600 truncate">
                          Com Avaliadores
                        </dt>
                        <dd className="text-lg font-medium text-purple-900">
                          {evaluationStats?.projectsWithEvaluators || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 overflow-hidden shadow rounded-lg border border-orange-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-orange-600 truncate">
                          Sem Avaliadores
                        </dt>
                        <dd className="text-lg font-medium text-orange-900">
                          {evaluationStats?.projectsWithoutEvaluators || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              {/* Projetos Pendentes de Avaliação */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        Projetos Pendentes de Avaliação
                      </h3>
                      <button
                        onClick={() => setViewMode('projects')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        Ver todos
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {pendingProjects.length > 0 ? (
                      <div className="space-y-3">
                        {pendingProjects.slice(0, 5).map((project) => (
                          <div
                            key={project.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {project.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Submetido por {project.owner?.name} • {formatDate(project.submissionDate || project.createdAt)}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    Categoria {project.category}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {project.areaConhecimento?.nome}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-4">
                                <button
                                  onClick={() => handleEditProject(project)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Editar projeto"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => navigate(`/projects/${project.id}`)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-sm text-gray-600">Nenhum projeto pendente de avaliação</p>
                        <p className="text-xs text-gray-400 mt-1">Todos os projetos foram processados</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Atividades Recentes */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Atividades Recentes
                    </h3>

                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {recentActivities.slice(0, 8).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 leading-relaxed">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.user} • {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Administrativas - ATUALIZADO COM AVALIAÇÕES */}
            <div className="bg-white shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Ações Administrativas Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <button
                    onClick={() => setViewMode('projects')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                  >
                    <Eye className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-gray-900">Gerenciar Projetos</h4>
                    <p className="text-sm text-gray-600">Visualizar, editar e deletar projetos</p>
                  </button>
                  
                  <button 
                    onClick={() => setViewMode('users')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                  >
                    <Users className="w-6 h-6 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-gray-900">Gestão de Usuários</h4>
                    <p className="text-sm text-gray-600">Criar, editar e gerenciar usuários</p>
                  </button>
                  
                  {/* NOVO BOTÃO PARA AVALIAÇÕES */}
                  <button 
                    onClick={() => setViewMode('evaluations')}
                    className="p-4 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left group relative"
                  >
                    <ClipboardList className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-gray-900">Sistema de Avaliações</h4>
                    <p className="text-sm text-gray-600">Distribuir e gerenciar avaliadores</p>
                    {evaluationStats?.projectsWithoutEvaluators && evaluationStats.projectsWithoutEvaluators > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {evaluationStats.projectsWithoutEvaluators}
                      </span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => navigate('/admin/reports')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                  >
                    <BarChart3 className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-gray-900">Relatórios</h4>
                    <p className="text-sm text-gray-600">Gerar relatórios detalhados</p>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/admin/evaluator-applications')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                    <Star className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-gray-900">Candidaturas de Avaliador</h4>
                    <p className="text-sm text-gray-600">Aprovar e gerenciar solicitações de avaliadores</p>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Management View - MANTIDO IGUAL */}
        {viewMode === 'users' && (
          <div className="space-y-6">
            {/* Header e Filtros */}
            <div className="bg-white shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Gestão de Usuários</h3>
                    <p className="text-sm text-gray-500">
                      {filteredUsers.length} usuário(s) encontrado(s)
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="flex gap-2">
                      <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Todos os roles</option>
                        <option value="AUTOR">Autores</option>
                        <option value="ORIENTADOR">Orientadores</option>
                        <option value="AVALIADOR">Avaliadores</option>
                        <option value="ADMINISTRADOR">Administradores</option>
                      </select>
                      
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar usuários..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowCreateUserModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Usuário
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Usuários */}
            <div className="bg-white shadow rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projetos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cadastro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              {user.city && user.state && (
                                <div className="text-xs text-gray-400">
                                  {user.city}, {user.state}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {user._count?.projects || 0}
                            </span>
                            {user._count?.participations ? (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Users className="w-4 h-4" />
                                {user._count.participations}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar usuário"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id, user.name)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Resetar senha"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deletar usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Nenhum usuário encontrado</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchTerm || userFilter !== 'all' 
                        ? 'Tente ajustar os filtros de busca' 
                        : 'Criar o primeiro usuário do sistema'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Projects Management View - MANTIDO IGUAL */}
        {viewMode === 'projects' && (
          <div className="space-y-6">
            {/* Header e Filtros */}
            <div className="bg-white shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Gestão de Projetos</h3>
                    <p className="text-sm text-gray-500">
                      {filteredProjects.length} projeto(s) encontrado(s)
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="flex gap-2">
                      <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Todos os status</option>
                        <option value="RASCUNHO">Rascunho</option>
                        <option value="SUBMETIDO">Submetido</option>
                        <option value="EM_AVALIACAO">Em Avaliação</option>
                        <option value="APROVADO_CIAS">Aprovado</option>
                        <option value="REPROVADO_CIAS">Reprovado</option>
                        <option value="FINALISTA_PRESENCIAL">Finalista</option>
                        <option value="PREMIADO">Premiado</option>
                      </select>
                      
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar projetos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações em Lote */}
                {selectedProjects.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        {selectedProjects.length} projeto(s) selecionado(s)
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBulkStatusUpdate('APROVADO_CIAS')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleBulkStatusUpdate('REPROVADO_CIAS')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reprovar
                        </button>
                        <button
                          onClick={() => setSelectedProjects([])}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de Projetos */}
            <div className="bg-white shadow rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects(filteredProjects.map(p => p.id));
                            } else {
                              setSelectedProjects([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projeto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Autor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjects.map((project) => (
                      <tr 
                        key={project.id} 
                        className={`hover:bg-gray-50 ${selectedProjects.includes(project.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedProjects.includes(project.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProjects(prev => [...prev, project.id]);
                              } else {
                                setSelectedProjects(prev => prev.filter(id => id !== project.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {project.title}
                            </div>
                            {project.summary && (
                              <div className="text-xs text-gray-500 truncate mt-1">
                                {project.summary}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              {project.areaConhecimento?.nome}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {project.owner?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.owner?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                            {getProjectStatusInfo(project.status as any)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.category?.replace('CATEGORIA_', 'Cat. ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(project.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/projects/${project.id}`)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProject(project)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar projeto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deletar projeto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Nenhum projeto encontrado</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchTerm || projectFilter !== 'all' 
                        ? 'Tente ajustar os filtros de busca' 
                        : 'Aguardando projetos do sistema'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Evaluations Management View - IMPLEMENTAÇÃO COMPLETA */}
        {viewMode === 'evaluations' && (
          <div className="space-y-6">
            {/* Header e Estatísticas */}
            <div className="bg-white shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Sistema de Avaliações</h3>
                    <p className="text-sm text-gray-500">
                      Gerencie a distribuição de avaliadores e monitore o progresso das avaliações
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => handleDistributeAll()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Distribuir Automaticamente
                    </button>
                    <button 
                      onClick={() => setShowManualDistribution(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Target className="w-4 h-4" />
                      Distribuição Manual
                    </button>
                    <button 
                      onClick={() => fetchEvaluationStats()}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Atualizar
                    </button>
                  </div>
                </div>

                {/* Estatísticas Detalhadas */}
                {evaluationStats && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ClipboardList className="w-6 h-6 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-900">Total de Projetos</p>
                          <p className="text-2xl font-bold text-blue-900">{evaluationStats.totalProjects}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <UserCheck className="w-6 h-6 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-900">Com Avaliadores</p>
                          <p className="text-2xl font-bold text-green-900">{evaluationStats.projectsWithEvaluators}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-orange-900">Sem Avaliadores</p>
                          <p className="text-2xl font-bold text-orange-900">{evaluationStats.projectsWithoutEvaluators}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Activity className="w-6 h-6 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-900">Progresso</p>
                          <p className="text-2xl font-bold text-purple-900">{evaluationStats.evaluationProgress}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Barra de Progresso Geral */}
                {evaluationStats && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progresso das Avaliações</span>
                      <span>{evaluationStats.completedEvaluations}/{evaluationStats.totalProjects}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${evaluationStats.evaluationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filtros e Ações */}
            <div className="bg-white shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={evaluationFilter}
                    onChange={(e) => setEvaluationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os projetos</option>
                    <option value="with_evaluators">Com avaliadores</option>
                    <option value="without_evaluators">Sem avaliadores</option>
                    <option value="completed">Avaliações concluídas</option>
                    <option value="pending">Avaliações pendentes</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as categorias</option>
                    <option value="I">Categoria I</option>
                    <option value="II">Categoria II</option>
                    <option value="III">Categoria III</option>
                    <option value="IV">Categoria IV</option>
                    <option value="V">Categoria V</option>
                    <option value="VI">Categoria VI</option>
                    <option value="VII">Categoria VII</option>
                    <option value="VIII">Categoria VIII</option>
                    <option value="IX">Categoria IX</option>
                    <option value="RELATO">Relato</option>
                  </select>

                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar projetos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Projetos com Status de Avaliação */}
            <div className="bg-white shadow rounded-lg border overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Projetos e Status de Avaliação</h4>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="text-sm font-medium text-gray-900 truncate">
                                {project.title}
                              </h5>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {getProjectStatusInfo(project.status as any)?.label}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Categoria {project.category}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span>{project.owner?.name}</span>
                              <span>{project.areaConhecimento?.nome}</span>
                              <span>Criado em {formatDate(project.createdAt)}</span>
                            </div>

                            {/* Status de Avaliação */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {project.avaliacoes?.length || 0} avaliador(es)
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">
                                  {project.avaliacoes?.filter(a => a.isCompleted).length || 0} concluída(s)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-gray-600">
                                  {project.avaliacoes?.filter(a => !a.isCompleted).length || 0} pendente(s)
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleViewEvaluations(project.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver avaliações"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleManualAssign(project.id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Atribuir avaliador"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleEditProject(project)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Editar projeto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredProjects.length === 0 && (
                      <div className="text-center py-8">
                        <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-500">Nenhum projeto encontrado</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Ajuste os filtros para ver mais resultados
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Ações em Lote */}
            {selectedProjects.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {selectedProjects.length} projeto(s) selecionado(s)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkDistribute()}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Distribuir Avaliadores
                    </button>
                    <button
                      onClick={() => setSelectedProjects([])}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* System Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Sistema operacional</p>
              <p className="text-green-700 text-sm">
                {adminStats?.projects.total || stats?.total || 0} projetos • {adminStats?.users.total || users.length} usuários • {pendingProjects.length} pendentes de avaliação
                {evaluationStats && ` • ${evaluationStats.projectsWithEvaluators} com avaliadores`}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modais */}
      <EditUserModal
        user={editingUser}
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        onSave={handleSaveUser}
      />

      <EditProjectModal
        project={editingProject}
        isOpen={showEditProjectModal}
        onClose={() => setShowEditProjectModal(false)}
        onSave={handleSaveProject}
      />

      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSave={(newUser) => {
          setUsers(prev => [newUser, ...prev]);
          setShowCreateUserModal(false);
          fetchAdminData(); // Recarregar para atualizar estatísticas
        }}
      />
    </div>
  );
};

export default AdminDashboard;