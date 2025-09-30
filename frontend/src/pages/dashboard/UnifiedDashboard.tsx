// frontend/src/pages/dashboard/UnifiedDashboard.tsx
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
import ProjectEvaluationCard from '../../components/evaluation/ProjectEvaluationCard';
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

interface Evaluation {
  id: string;
  isCompleted: boolean;
  completedAt: string | null;
  notaFinal: number | null;
  project: {
    id: string;
    title: string;
    summary: string;
    category: string;
    status: string;
    areaConhecimento: {
      nome: string;
    };
    owner: {
      name: string;
      email: string;
    };
    orientadores: Array<{
      name: string;
      email: string;
      institution: string;
    }>;
    membersCount: number;
  };
}

type TabType = 'orientador' | 'avaliador';

const UnifiedDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading } = useProjectStats();
  const { projects, loading: projectsLoading, createProject } = useProjects({ limit: 10 });
  
  const [activeTab, setActiveTab] = useState<TabType>('orientador');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [evaluatorApplication, setEvaluatorApplication] = useState<EvaluatorApplication | null>(null);
  const [evaluatorStats, setEvaluatorStats] = useState<EvaluatorStats | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [isAlsoEvaluator, setIsAlsoEvaluator] = useState(false);
  const [evaluationFilter, setEvaluationFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvaluatorApplicationStatus();
    checkIfIsEvaluator();
  }, []);

  useEffect(() => {
    if (isAlsoEvaluator) {
      fetchEvaluations();
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

  const fetchEvaluations = async () => {
    try {
      setLoadingEvaluations(true);
      const response = await api.get('/evaluations/my-evaluations');
      if (response.data) {
        setEvaluations(response.data);
        
        const stats = {
          totalEvaluations: response.data.length,
          pendingEvaluations: response.data.filter((e: any) => !e.isCompleted).length,
          completedEvaluations: response.data.filter((e: any) => e.isCompleted).length
        };
        setEvaluatorStats(stats);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoadingEvaluations(false);
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

  const canApplyForEvaluator = () => {
    return user?.role !== 'AVALIADOR' && !evaluatorApplication;
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

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (evaluationFilter === 'pending') return !evaluation.isCompleted;
    if (evaluationFilter === 'completed') return evaluation.isCompleted;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Painel do {activeTab === 'orientador' ? 'Orientador' : 'Avaliador'}
              </h1>
              <p className="text-sm text-gray-500">
                Gerencie suas atividades na FEBIC
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Orientador
                  </span>
                  {isAlsoEvaluator && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Avaliador
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors p-2 border border-gray-300 rounded-lg hover:border-red-300"
                title="Sair do sistema"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          {isAlsoEvaluator && (
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setActiveTab('orientador')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orientador'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Orientação
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                    {stats?.total || 0}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('avaliador')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'avaliador'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Avaliações
                  {evaluatorStats && evaluatorStats.pendingEvaluations > 0 && (
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {evaluatorStats.pendingEvaluations}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Tab Content: Orientador */}
        {activeTab === 'orientador' && (
          <>
            {/* Welcome Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Olá, Prof. {user?.name}!
                </h2>
                <p className="text-gray-600">
                  Bem-vindo ao FEBIC! Aqui você pode acompanhar e orientar os projetos dos seus alunos.
                </p>
              </div>
            </div>

            {/* Stats Cards - Orientador */}
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

            {/* Projetos Pendentes + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Meus Projetos Recentes
                      </h3>
                    </div>

                    {projectsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : projects && projects.length > 0 ? (
                      <div className="space-y-4">
                        {projects.slice(0, 5).map((project) => (
                          <div
                            key={project.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
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
                                    <span>{formatDate(project.updatedAt)}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleViewProject(project)}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  Ver Detalhes
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum projeto ainda
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Comece criando seu primeiro projeto!
                        </p>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Criar Projeto
                        </button>
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
                      Criar Projeto
                    </button>
                    
                    <button
                      onClick={() => navigate('/projects')}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                      Ver Todos os Projetos
                    </button>

                    {canApplyForEvaluator() && (
                      <button
                        onClick={() => setShowEvaluatorModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Star className="h-5 w-5" />
                        Quero ser Avaliador
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab Content: Avaliador */}
        {activeTab === 'avaliador' && (
          <>
            {/* Welcome Card - Avaliador */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Painel de Avaliações
                </h2>
                <p className="text-gray-600">
                  Gerencie e acompanhe suas avaliações de projetos da FEBIC
                </p>
              </div>
            </div>

            {/* Stats Cards - Avaliador */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total de Projetos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {evaluatorStats?.totalEvaluations || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {evaluatorStats?.pendingEvaluations || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Concluídas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {evaluatorStats?.completedEvaluations || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Nota Média</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {evaluations.length > 0
                          ? (evaluations
                              .filter(e => e.notaFinal !== null)
                              .reduce((sum, e) => sum + (e.notaFinal || 0), 0) /
                            evaluations.filter(e => e.notaFinal !== null).length).toFixed(1)
                          : '--'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">
                  Meus Projetos para Avaliação
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEvaluationFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      evaluationFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos ({evaluatorStats?.totalEvaluations || 0})
                  </button>
                  <button
                    onClick={() => setEvaluationFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      evaluationFilter === 'pending'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pendentes ({evaluatorStats?.pendingEvaluations || 0})
                  </button>
                  <button
                    onClick={() => setEvaluationFilter('completed')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      evaluationFilter === 'completed'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Concluídas ({evaluatorStats?.completedEvaluations || 0})
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Avaliações */}
            <div className="space-y-6">
              {loadingEvaluations ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredEvaluations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma avaliação encontrada
                  </h3>
                  <p className="text-gray-600">
                    {evaluationFilter === 'all'
                      ? 'Você não possui projetos atribuídos para avaliação.'
                      : `Nenhum projeto ${evaluationFilter === 'pending' ? 'pendente' : 'concluído'} encontrado.`}
                  </p>
                </div>
              ) : (
                filteredEvaluations.map((evaluation) => (
                  <ProjectEvaluationCard
                    key={evaluation.id}
                    evaluation={evaluation}
                    onViewDetails={() => navigate(`/evaluation/${evaluation.id}`)}
                    onStartEvaluation={() => navigate(`/evaluation/${evaluation.id}/form`)}
                  />
                ))
              )}
            </div>
          </>
        )}
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

export default UnifiedDashboard;