import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects, useProjectStats } from '../../hooks/useProjects';
import { 
  Users, FileText, CheckCircle, Clock, LogOut, Eye, BarChart3, 
  AlertTriangle, TrendingUp, Calendar, Filter, Search, ArrowRight,
  UserCheck, UserX, Star, Award, DollarSign, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project, getProjectStatusInfo } from '../../types/Project';
import api from '../../services/api';

// Interface para usuários
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: {
    projects?: number;
  };
}

// Interface para atividades recentes
interface RecentActivity {
  id: string;
  type: 'project_created' | 'project_submitted' | 'user_registered' | 'project_approved';
  description: string;
  user: string;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading } = useProjectStats();
  const { projects: allProjects, loading: projectsLoading } = useProjects({ limit: 10 });
  const navigate = useNavigate();

  // Estados para dados administrativos
  const [users, setUsers] = useState<User[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para filtros
  const [userFilter, setUserFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('7'); // últimos 7 dias

  // Buscar dados administrativos
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários (simulado - você precisa criar este endpoint)
      const usersResponse = await api.get('/admin/users');
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data || []);
      }

      // Buscar projetos pendentes
      const pendingResponse = await api.get('/projects', { 
        params: { status: 'SUBMETIDO', limit: 5 } 
      });
      if (pendingResponse.data.success) {
        setPendingProjects(pendingResponse.data.data?.projects || pendingResponse.data.data || []);
      }

      // Simular atividades recentes (você pode criar um endpoint real)
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'project_submitted',
          description: 'Projeto "IA na Educação" foi submetido para avaliação',
          user: 'Bruno Soares',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'user_registered',
          description: 'Novo usuário cadastrado no sistema',
          user: 'Maria Silva',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'project_created',
          description: 'Projeto "Biotecnologia Aplicada" foi criado',
          user: 'João Santos',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
      ];
      setRecentActivities(mockActivities);

    } catch (error) {
      console.error('Erro ao buscar dados administrativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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
    return `${diffDays}d atrás`;
  };

  const getStatusColor = (status: string) => {
    const statusInfo = getProjectStatusInfo(status as any);
    const colorMap = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Administrativo
              </h1>
              <p className="text-sm text-gray-500">Visão geral do sistema FEBIC</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors p-2 border border-gray-300 rounded"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
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
                      {loading ? '...' : users.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
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
                      {statsLoading ? '...' : stats?.total || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
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
                      {statsLoading ? '...' : stats?.byStatus.SUBMETIDO || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
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

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Finalizados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? '...' : (stats?.byStatus.PREMIADO || 0) + (stats?.byStatus.FINALISTA_PRESENCIAL || 0)}
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
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Projetos Pendentes de Avaliação
                  </h3>
                  <button
                    onClick={() => navigate('/projects?status=SUBMETIDO')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    Ver todos
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {pendingProjects.length > 0 ? (
                  <div className="space-y-3">
                    {pendingProjects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/projects`)}
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
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Categoria {project.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                {project.areaConhecimento?.nome}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm text-gray-600">Nenhum projeto pendente de avaliação</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Atividades Recentes
                </h3>

                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
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

        {/* Gestão de Usuários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Usuários Recentes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Usuários Recentes
                </h3>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  Gerenciar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {user._count?.projects || 0} projetos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Estatísticas Detalhadas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Estatísticas por Status
              </h3>

              <div className="space-y-3">
                {stats && Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getProjectStatusInfo(status as any)?.label}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver relatórios completos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Administrativas */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Ações Administrativas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Eye className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900">Todos os Projetos</h4>
                <p className="text-sm text-gray-600">Visualizar e gerenciar projetos</p>
              </button>
              
              <button 
                onClick={() => navigate('/admin/users')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Users className="w-6 h-6 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900">Gestão de Usuários</h4>
                <p className="text-sm text-gray-600">Gerenciar contas de usuários</p>
              </button>
              
              <button 
                onClick={() => navigate('/admin/evaluations')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <CheckCircle className="w-6 h-6 text-yellow-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900">Sistema de Avaliações</h4>
                <p className="text-sm text-gray-600">Configurar e monitorar avaliações</p>
              </button>
              
              <button 
                onClick={() => navigate('/admin/reports')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <BarChart3 className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900">Relatórios</h4>
                <p className="text-sm text-gray-600">Gerar relatórios detalhados</p>
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-green-800 font-medium">Sistema operacional</p>
              <p className="text-green-700 text-sm">
                {stats?.total || 0} projetos • {users.length} usuários • {stats?.byStatus.SUBMETIDO || 0} pendentes de avaliação
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;