import React, { useState, useEffect } from 'react';
import { Eye, FileText, Clock, CheckCircle, AlertCircle, Users, Star, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Project {
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
}

interface Evaluation {
  id: string;
  isCompleted: boolean;
  completedAt: string | null;
  notaFinal: number | null;
  project: Project;
}

const EvaluatorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluations/my-evaluations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar avaliações');
      }

      const data = await response.json();
      setEvaluations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (filter === 'pending') return !evaluation.isCompleted;
    if (filter === 'completed') return evaluation.isCompleted;
    return true;
  });

  const stats = {
    total: evaluations.length,
    pending: evaluations.filter(e => !e.isCompleted).length,
    completed: evaluations.filter(e => e.isCompleted).length,
    averageGrade: evaluations
      .filter(e => e.notaFinal !== null)
      .reduce((sum, e) => sum + (e.notaFinal || 0), 0) / 
      evaluations.filter(e => e.notaFinal !== null).length || 0
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'I': 'Categoria I - Educação Infantil',
      'II': 'Categoria II - Fundamental (1º-6º)',
      'III': 'Categoria III - Fundamental (7º-9º)',
      'IV': 'Categoria IV - Técnico Subsequente',
      'V': 'Categoria V - EJA',
      'VI': 'Categoria VI - Ensino Médio',
      'VII': 'Categoria VII - Ensino Superior',
      'VIII': 'Categoria VIII - Pós-Graduação',
      'IX': 'Categoria IX - Pesquisadores',
      'RELATO': 'Relato de Experiência'
    };
    return categories[category] || category;
  };

  const getStatusColor = (evaluation: Evaluation) => {
    if (evaluation.isCompleted) return 'text-green-600 bg-green-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getStatusIcon = (evaluation: Evaluation) => {
    if (evaluation.isCompleted) return <CheckCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="Voltar"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Dashboard do Avaliador
                  </h1>
                  <p className="text-sm text-gray-500">Gerencie suas avaliações de projetos da FEBIC</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Avaliador</p>
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
          </div>
        </header>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="Voltar"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Dashboard do Avaliador
                  </h1>
                  <p className="text-sm text-gray-500">Gerencie suas avaliações de projetos da FEBIC</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Avaliador</p>
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
          </div>
        </header>

        {/* Error Content */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Erro ao carregar dados</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchEvaluations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard do Avaliador
                </h1>
                <p className="text-sm text-gray-500">Gerencie suas avaliações de projetos da FEBIC</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Avaliador</p>
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
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Minhas Avaliações</h2>
          <p className="text-gray-600">Gerencie e acompanhe o progresso das suas avaliações</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nota Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageGrade ? stats.averageGrade.toFixed(1) : '--'}
                </p>
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
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendentes ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Concluídas ({stats.completed})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Avaliações */}
        <div className="space-y-6">
          {filteredEvaluations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma avaliação encontrada
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Você não possui projetos atribuídos para avaliação.'
                  : `Nenhum projeto ${filter === 'pending' ? 'pendente' : 'concluído'} encontrado.`
                }
              </p>
            </div>
          ) : (
            filteredEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">
                          {evaluation.project.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(evaluation)}`}>
                          {getStatusIcon(evaluation)}
                          <span className="ml-1">
                            {evaluation.isCompleted ? 'Concluída' : 'Pendente'}
                          </span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {getCategoryName(evaluation.project.category)}
                      </p>
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {evaluation.project.summary}
                      </p>
                    </div>
                    {evaluation.notaFinal && (
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-600">Nota Final</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {evaluation.notaFinal.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <strong>Área:</strong> {evaluation.project.areaConhecimento.nome}
                      </p>
                      <p className="text-gray-600">
                        <strong>Autor:</strong> {evaluation.project.owner.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <strong>Orientador:</strong> {evaluation.project.orientadores[0]?.name || 'N/A'}
                      </p>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{evaluation.project.membersCount} membro(s)</span>
                      </div>
                    </div>
                  </div>

                  {evaluation.completedAt && (
                    <p className="text-sm text-gray-500 mb-4">
                      Concluída em: {new Date(evaluation.completedAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => window.location.href = `/evaluation/${evaluation.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </button>
                    {!evaluation.isCompleted && (
                      <button
                        onClick={() => window.location.href = `/evaluation/${evaluation.id}/form`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Avaliar Projeto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorDashboard;