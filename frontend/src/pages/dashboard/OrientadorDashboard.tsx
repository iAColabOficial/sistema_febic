// frontend/src/pages/dashboard/OrientadorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects, useProjectStats } from '../../hooks/useProjects';
import { 
  GraduationCap, 
  FileText, 
  Clock, 
  CheckCircle, 
  LogOut, 
  Eye, 
  ArrowRight, 
  Calendar, 
  Tag,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Plus,
  Star,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateProject from '../projects/CreateProject';
import EvaluatorApplicationModal from '../../components/evaluator/EvaluatorApplicationModal';
import { CreateProjectData, Project, getProjectStatusInfo } from '../../types/Project';
import api from '../../services/api';

interface EvaluatorApplication {
  id: string;
  status: 'PENDENTE' | 'APROVADA' | 'REPROVADA';
  createdAt: string;
  adminNotes?: string;
}

interface EvaluatorStats {
  totalEvaluations: number;
  pendingEvaluations: number;
  completedEvaluations: number;
}

const OrientadorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading } = useProjectStats();
  const { projects, loading: projectsLoading, createProject } = useProjects({ limit: 10 });
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [evaluatorApplication, setEvaluatorApplication] = useState<EvaluatorApplication | null>(null);
  const [evaluatorStats, setEvaluatorStats] = useState<EvaluatorStats | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [loadingEvaluatorStats, setLoadingEvaluatorStats] = useState(false);
  const [isAlsoEvaluator, setIsAlsoEvaluator] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvaluatorApplicationStatus();
    checkIfIsEvaluator();
  }, []);

  useEffect(() => {
    if (isAlsoEvaluator) {
      fetchEvaluatorStats();
    }
  }, [isAlsoEvaluator]);

  const fetchEvaluatorApplicationStatus = async () => {
    try {
      setLoadingApplication(true);
      const response = await api.get('/evaluator/my-application');
      if (response.data.success && response.data.data) {
        setEvaluatorApplication(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar status da candidatura:', error);
    } finally {
      setLoadingApplication(false);
    }
  };

  const checkIfIsEvaluator = async () => {
    try {
      const response = await api.get('/evaluations/my-evaluations');
      if (response.data && response.data.length > 0) {
        setIsAlsoEvaluator(true);
      }
    } catch (error) {
      setIsAlsoEvaluator(false);
    }
  };

  const fetchEvaluatorStats = async () => {
    try {
      setLoadingEvaluatorStats(true);
      const response = await api.get('/evaluations/my-evaluations');
      if (response.data) {
        const evaluations = response.data;
        setEvaluatorStats({
          totalEvaluations: evaluations.length,
          pendingEvaluations: evaluations.filter((e: any) => !e.isCompleted).length,
          completedEvaluations: evaluations.filter((e: any) => e.isCompleted).length
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de avaliador:', error);
    } finally {
      setLoadingEvaluatorStats(false);
    }
  };

  const handleCreateProject = async (data: CreateProjectData) => {
    await createProject(data);
    setShowCreateForm(false);
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEvaluateProject = (project: Project) => {
    navigate(`/projects/${project.id}/evaluate`);
  };

  const handleEvaluatorApplicationSuccess = () => {
    fetchEvaluatorApplicationStatus();
    checkIfIsEvaluator();
  };

  const handleGoToEvaluatorDashboard = () => {
    navigate('/dashboard/evaluator');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const statusInfo = getProjectStatusInfo(status as any);
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    return colorMap[statusInfo?.color || 'gray'];
  };

  const getApplicationStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return {
          label: 'Em análise',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'APROVADA':
        return {
          label: 'Aprovada',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'REPROVADA':
        return {
          label: 'Reprovada',
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="w-4 h-4" />
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="w-4 h-4" />
        };
    }
  };

  const canApplyForEvaluator = () => {
    return user?.role !== 'AVALIADOR' && !evaluatorApplication;
  };

  const isActiveEvaluator = () => {
    return user?.role === 'AVALIADOR' || 
           evaluatorApplication?.status === 'APROVADA' || 
           isAlsoEvaluator;
  };

  const projectsPendingEvaluation = projects?.filter(p => 
    p.status === 'SUBMETIDO' || p.status === 'EM_ANALISE_CIAS'
  ) || [];

  const projectsInProgress = projects?.filter(p => 
    p.status === 'RASCUNHO' || p.status === 'EM_ANALISE_CIAS'
  ) || [];

  const projectsCompleted = projects?.filter(p => 
    p.status === 'APROVADO_CIAS' || p.status === 'FINALISTA_PRESENCIAL' || p.status === 'PREMIADO'
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Painel do Orientador
                {isActiveEvaluator() && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Star className="w-3 h-3 mr-1" />
                    Avaliador
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isActiveEvaluator() && (
                <button
                  onClick={handleGoToEvaluatorDashboard}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <ClipboardList className="w-4 h-4" />
                  Minhas Avaliações
                  {evaluatorStats?.pendingEvaluations && evaluatorStats.pendingEvaluations > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {evaluatorStats.pendingEvaluations}
                    </span>
                  )}
                </button>
              )}
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  Orientador{isActiveEvaluator() ? ' • Avaliador' : ''}
                </p>
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
        {/* Welcome Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Olá, Prof. {user?.name}!
            </h2>
            <p className="text-gray-600">
              Bem-vindo ao FEBIC! Aqui você pode acompanhar e orientar os projetos dos seus alunos
              {isActiveEvaluator() && ', e também avaliar projetos de outros participantes'}.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Projetos Orientando
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
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pendentes Avaliação
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? '...' : projectsPendingEvaluation.length}
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
                      Em Andamento
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? '...' : projectsInProgress.length}
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
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Aprovados/Premiados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? '...' : projectsCompleted.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats adicionais de Avaliador */}
        {isActiveEvaluator() && evaluatorStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 overflow-hidden shadow rounded-lg border border-purple-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardList className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-600 truncate">
                        Avaliações Atribuídas
                      </dt>
                      <dd className="text-lg font-medium text-purple-900">
                        {loadingEvaluatorStats ? '...' : evaluatorStats.totalEvaluations}
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
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-orange-600 truncate">
                        Avaliações Pendentes
                      </dt>
                      <dd className="text-lg font-medium text-orange-900">
                        {loadingEvaluatorStats ? '...' : evaluatorStats.pendingEvaluations}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projetos Pendentes */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Projetos Pendentes de Avaliação
                  </h3>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                    {projectsPendingEvaluation.length}
                  </span>
                </div>

                {projectsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : projectsPendingEvaluation.length > 0 ? (
                  <div className="space-y-4">
                    {projectsPendingEvaluation.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {project.title}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {getProjectStatusInfo(project.status as any)?.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{project.members?.length || 0} integrante(s)</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Submetido em {formatDate(project.submissionDate || project.createdAt)}</span>
                              </div>

                              {project.areaConhecimento && (
                                <div className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  <span>{project.areaConhecimento.nome}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEvaluateProject(project)}
                                className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                              >
                                Avaliar Projeto
                              </button>
                              <button
                                onClick={() => handleViewProject(project)}
                                className="text-xs text-gray-600 hover:text-gray-800 underline"
                              >
                                Ver Detalhes
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum projeto pendente
                    </h3>
                    <p className="text-gray-600">
                      Todos os projetos estão avaliados em dia!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5" />
                  Criar Projeto para Aluno
                </button>
                
                <button
                  onClick={() => navigate('/projects')}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-5 w-5" />
                  Ver Todos os Projetos
                </button>                

                {isActiveEvaluator() && (
                  <button
                    onClick={handleGoToEvaluatorDashboard}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors relative"
                  >
                    <ClipboardList className="h-5 w-5" />
                    Minhas Avaliações
                    {evaluatorStats?.pendingEvaluations && evaluatorStats.pendingEvaluations > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {evaluatorStats.pendingEvaluations}
                      </span>
                    )}
                  </button>
                )}

                {canApplyForEvaluator() ? (
                  <button
                    onClick={() => setShowEvaluatorModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Star className="h-5 w-5" />
                    Quero ser Avaliador
                  </button>
                ) : evaluatorApplication && user?.role !== 'AVALIADOR' && (
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      {getApplicationStatusInfo(evaluatorApplication.status).icon}
                      <span className="text-sm font-medium text-gray-900">Candidatura a Avaliador</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusInfo(evaluatorApplication.status).color} mb-2`}>
                      {getApplicationStatusInfo(evaluatorApplication.status).label}
                    </span>
                    <p className="text-xs text-gray-600">
                      {evaluatorApplication.status === 'PENDENTE' && 'Sua candidatura está sendo analisada'}
                      {evaluatorApplication.status === 'APROVADA' && 'Parabéns! Sua candidatura foi aprovada'}
                      {evaluatorApplication.status === 'REPROVADA' && 'Sua candidatura foi reprovada'}
                    </p>
                    {evaluatorApplication.adminNotes && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        "{evaluatorApplication.adminNotes}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo Mensal</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Projetos orientados</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de aprovação</span>
                  <span className="text-sm font-medium text-green-600">
                    {stats?.total ? Math.round((projectsCompleted.length / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avaliações pendentes</span>
                  <span className="text-sm font-medium text-orange-600">{projectsPendingEvaluation.length}</span>
                </div>
                
                {isActiveEvaluator() && evaluatorStats && (
                  <>
                    <hr className="my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600">Como avaliador</span>
                      <span className="text-sm font-medium text-purple-600">{evaluatorStats.totalEvaluations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600">Avaliações pendentes</span>
                      <span className="text-sm font-medium text-orange-600">{evaluatorStats.pendingEvaluations}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Atividade Recente
              </h3>
              <div className="space-y-3">
                {projects?.slice(0, 3).map((project) => (
                  <div key={project.id} className="text-sm">
                    <p className="text-gray-900 font-medium truncate">{project.title}</p>
                    <p className="text-gray-500">
                      Atualizado em {formatDate(project.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-green-800 font-medium">Sistema conectado!</p>
              <p className="text-green-700 text-sm">
                Você está orientando {stats?.total || 0} projeto{(stats?.total || 0) !== 1 ? 's' : ''} no FEBIC
                {isActiveEvaluator() && evaluatorStats && `, e tem ${evaluatorStats.totalEvaluations} projeto${evaluatorStats.totalEvaluations !== 1 ? 's' : ''} para avaliar`}.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateForm && (
        <CreateProject
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <EvaluatorApplicationModal
        isOpen={showEvaluatorModal}
        onClose={() => setShowEvaluatorModal(false)}
        onSuccess={handleEvaluatorApplicationSuccess}
      />
    </div>
  );
};

export default OrientadorDashboard;