import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Play, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';

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

interface Project {
  id: string;
  title: string;
  category: string;
  status: string;
  avaliacoes: Array<{
    id: string;
    isCompleted: boolean;
    avaliador: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface Evaluator {
  id: string;
  name: string;
  email: string;
  institution?: string;
  formation?: string;
  conflicts: string[];
  isEligible: boolean;
}

const EvaluationAdmin: React.FC = () => {
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [availableEvaluators, setAvailableEvaluators] = useState<Evaluator[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-evaluators' | 'without-evaluators'>('all');
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchProjects();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/evaluations/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar estatísticas');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?status=FINALISTA_PRESENCIAL,CONFIRMADO_VIRTUAL&include=avaliacoes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar projetos');
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEvaluators = async (projectId: string) => {
    try {
      const response = await fetch(`/api/evaluations/admin/projects/${projectId}/available-evaluators`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar avaliadores');
      
      const data = await response.json();
      setAvailableEvaluators(data);
    } catch (err) {
      console.error('Erro ao carregar avaliadores:', err);
    }
  };

  const distributeAllEvaluators = async () => {
    if (!confirm('Deseja distribuir avaliadores automaticamente para todos os projetos? Esta ação pode demorar alguns minutos.')) {
      return;
    }

    setDistributing(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluations/distribute/all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro na distribuição automática');
      
      const result = await response.json();
      
      alert(`Distribuição concluída!\nSucesso: ${result.success}\nFalhas: ${result.failed}`);
      
      fetchStats();
      fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setDistributing(false);
    }
  };

  const distributeProjectEvaluators = async (projectId: string) => {
    setDistributing(true);
    
    try {
      const response = await fetch(`/api/evaluations/distribute/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro na distribuição');
      
      const result = await response.json();
      
      if (result.success) {
        alert('Avaliadores distribuídos com sucesso!');
        fetchProjects();
        fetchStats();
      } else {
        alert(`Erro: ${result.message}`);
      }
    } catch (err) {
      alert('Erro ao distribuir avaliadores');
    } finally {
      setDistributing(false);
    }
  };

  const assignEvaluator = async (projectId: string, evaluatorId: string) => {
    try {
      const response = await fetch('/api/evaluations/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ projectId, evaluatorId })
      });

      if (!response.ok) throw new Error('Erro ao atribuir avaliador');
      
      alert('Avaliador atribuído com sucesso!');
      fetchProjects();
      fetchStats();
      setShowEvaluatorModal(false);
    } catch (err) {
      alert('Erro ao atribuir avaliador');
    }
  };

  const removeEvaluator = async (projectId: string, evaluatorId: string) => {
    if (!confirm('Deseja remover este avaliador do projeto?')) return;

    try {
      const response = await fetch(`/api/evaluations/projects/${projectId}/evaluators/${evaluatorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao remover avaliador');
      
      alert('Avaliador removido com sucesso!');
      fetchProjects();
      fetchStats();
    } catch (err) {
      alert('Erro ao remover avaliador');
    }
  };

  const openEvaluatorModal = async (project: Project) => {
    setSelectedProject(project);
    await fetchAvailableEvaluators(project.id);
    setShowEvaluatorModal(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'with-evaluators') {
      return matchesSearch && project.avaliacoes.length > 0;
    }
    if (filterStatus === 'without-evaluators') {
      return matchesSearch && project.avaliacoes.length === 0;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Avaliações</h1>
            <p className="text-gray-600">Distribua e gerencie avaliadores para os projetos classificados</p>
          </div>
          <button
            onClick={distributeAllEvaluators}
            disabled={distributing}
            className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4 mr-2" />
            {distributing ? 'Distribuindo...' : 'Distribuir Todos'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Projetos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Com Avaliadores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.projectsWithEvaluators}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sem Avaliadores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.projectsWithoutEvaluators}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progresso</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.evaluationProgress}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os projetos</option>
                <option value="with-evaluators">Com avaliadores</option>
                <option value="without-evaluators">Sem avaliadores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Projetos */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum projeto encontrado</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Não há projetos classificados para avaliação.'
                }
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Categoria {project.category}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.avaliacoes.length === 0 
                            ? 'text-red-700 bg-red-100'
                            : project.avaliacoes.length >= 3
                            ? 'text-green-700 bg-green-100'
                            : 'text-yellow-700 bg-yellow-100'
                        }`}>
                          {project.avaliacoes.length}/3 avaliadores
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEvaluatorModal(project)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </button>
                      {project.avaliacoes.length === 0 && (
                        <button
                          onClick={() => distributeProjectEvaluators(project.id)}
                          disabled={distributing}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Auto
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista de Avaliadores */}
                  {project.avaliacoes.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Avaliadores Atribuídos:</h4>
                      <div className="space-y-2">
                        {project.avaliacoes.map((avaliacao) => (
                          <div key={avaliacao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {avaliacao.avaliador.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {avaliacao.avaliador.email}
                                </p>
                              </div>
                              <div className="ml-4">
                                {avaliacao.isCompleted ? (
                                  <span className="inline-flex items-center text-green-600">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Concluída</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-orange-600">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Pendente</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            {!avaliacao.isCompleted && (
                              <button
                                onClick={() => removeEvaluator(project.id, avaliacao.avaliador.id)}
                                className="ml-3 p-1 text-red-600 hover:text-red-800"
                                title="Remover avaliador"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Seleção de Avaliador */}
        {showEvaluatorModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Adicionar Avaliador - {selectedProject.title}
                </h2>
                <p className="text-gray-600">Selecione um avaliador elegível para este projeto</p>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="space-y-3">
                  {availableEvaluators.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      Nenhum avaliador elegível encontrado
                    </p>
                  ) : (
                    availableEvaluators.map((evaluator) => (
                      <div
                        key={evaluator.id}
                        className={`p-4 rounded-lg border ${
                          evaluator.isEligible 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{evaluator.name}</h3>
                            <p className="text-sm text-gray-600">{evaluator.email}</p>
                            {evaluator.institution && (
                              <p className="text-sm text-gray-600">{evaluator.institution}</p>
                            )}
                            {evaluator.formation && (
                              <p className="text-xs text-gray-500">{evaluator.formation}</p>
                            )}
                            
                            {evaluator.conflicts.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-red-600 mb-1">Conflitos:</p>
                                <ul className="text-xs text-red-600 space-y-1">
                                  {evaluator.conflicts.map((conflict, index) => (
                                    <li key={index}>• {conflict}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {evaluator.isEligible && (
                            <button
                              onClick={() => assignEvaluator(selectedProject.id, evaluator.id)}
                              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Atribuir
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowEvaluatorModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationAdmin;