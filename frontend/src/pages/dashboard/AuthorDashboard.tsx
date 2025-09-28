// frontend/src/components/dashboard/AuthorDashboard.tsx (versão atualizada)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects, useProjectStats } from '../../hooks/useProjects';
import { Plus, FileText, Clock, CheckCircle, LogOut, Eye, ArrowRight, Calendar, Tag, Star, AlertCircle } from 'lucide-react';
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

const AuthorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading } = useProjectStats();
  const { projects, loading: projectsLoading } = useProjects({ limit: 5 });
  const { createProject } = useProjects();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [evaluatorApplication, setEvaluatorApplication] = useState<EvaluatorApplication | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const navigate = useNavigate();

  // Buscar status da candidatura a avaliador
  useEffect(() => {
    fetchEvaluatorApplicationStatus();
  }, []);

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

  const handleCreateProject = async (data: CreateProjectData) => {
    await createProject(data);
    setShowCreateForm(false);
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects`);
  };

  const handleEvaluatorApplicationSuccess = () => {
    fetchEvaluatorApplicationStatus();
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

  // Verificar se pode aplicar para avaliador
  const canApplyForEvaluator = () => {
    return user?.role !== 'AVALIADOR' && !evaluatorApplication;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Meus Projetos
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Autor</p>
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
              Olá, {user?.name}!
            </h2>
            <p className="text-gray-600">
              Bem-vindo ao FEBIC! Aqui você pode criar e gerenciar seus projetos de iniciação científica.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Meus Projetos
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
                      Em Avaliação
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
        </div>

        {/* Create Project Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Novo Projeto
          </button>
        </div>

        {/* Recent Projects Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Meus Projetos Recentes
              </h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Ver todos
              </button>
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
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => handleViewProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getProjectStatusInfo(project.status as any)?.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Criado em {formatDate(project.createdAt)}</span>
                          </div>
                          
                          {project.areaConhecimento && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>{project.areaConhecimento.nome}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Categoria {project.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
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
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro projeto de iniciação científica!
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Primeiro Projeto
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions Quick Access */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Eye className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900">Gerenciar Projetos</h4>
                <p className="text-sm text-gray-600">Visualizar, editar e acompanhar todos os seus projetos</p>
              </button>
              
              <button
                onClick={() => navigate('/help')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <FileText className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900">Documentação</h4>
                <p className="text-sm text-gray-600">Acesse guias e documentos de apoio</p>
              </button>

              {/* Botão Quero ser Avaliador */}
              {canApplyForEvaluator() ? (
                <button
                  onClick={() => setShowEvaluatorModal(true)}
                  className="p-4 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left group"
                >
                  <Star className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium text-gray-900">Quero ser Avaliador</h4>
                  <p className="text-sm text-gray-600">Candidate-se para avaliar projetos da FEBIC</p>
                </button>
              ) : evaluatorApplication && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    {getApplicationStatusInfo(evaluatorApplication.status).icon}
                    <h4 className="font-medium text-gray-900">Candidatura a Avaliador</h4>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusInfo(evaluatorApplication.status).color} mb-2`}>
                    {getApplicationStatusInfo(evaluatorApplication.status).label}
                  </span>
                  <p className="text-sm text-gray-600">
                    {evaluatorApplication.status === 'PENDENTE' && 'Sua candidatura está sendo analisada'}
                    {evaluatorApplication.status === 'APROVADA' && 'Parabéns! Sua candidatura foi aprovada'}
                    {evaluatorApplication.status === 'REPROVADA' && 'Sua candidatura foi reprovada'}
                  </p>
                  {evaluatorApplication.adminNotes && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      "{evaluatorApplication.adminNotes}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-blue-800 font-medium">Sistema conectado!</p>
              <p className="text-blue-700 text-sm">
                Você tem {stats?.total || 0} projeto{(stats?.total || 0) !== 1 ? 's' : ''} cadastrado{(stats?.total || 0) !== 1 ? 's' : ''}.
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

export default AuthorDashboard;