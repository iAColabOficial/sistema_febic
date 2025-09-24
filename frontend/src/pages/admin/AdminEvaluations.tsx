import React, { useState, useEffect } from 'react';
import { 
  Star, Users, FileText, CheckCircle, Clock, 
  ArrowLeft, Plus, Search, Filter, Award,
  User, Calendar, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Evaluation {
  id: string;
  projectId: string;
  evaluatorId: string;
  score: number;
  status: string;
  createdAt: string;
  project: {
    title: string;
    category: string;
  };
  evaluator: {
    name: string;
  };
}

const AdminEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvaluations();
  }, [statusFilter, searchTerm]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      // Como ainda não temos endpoint de avaliações, simular dados
      const mockEvaluations: Evaluation[] = [
        {
          id: '1',
          projectId: 'proj1',
          evaluatorId: 'eval1',
          score: 8.5,
          status: 'CONCLUIDA',
          createdAt: new Date().toISOString(),
          project: {
            title: 'IA na Educação Básica',
            category: 'VII'
          },
          evaluator: {
            name: 'Dr. João Silva'
          }
        },
        {
          id: '2',
          projectId: 'proj2',
          evaluatorId: 'eval2',
          score: 0,
          status: 'PENDENTE',
          createdAt: new Date().toISOString(),
          project: {
            title: 'Sustentabilidade Urbana',
            category: 'VI'
          },
          evaluator: {
            name: 'Dra. Maria Santos'
          }
        }
      ];
      setEvaluations(mockEvaluations);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDA': return 'bg-green-100 text-green-800';
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Sistema de Avaliações
                </h1>
                <p className="text-sm text-gray-500">
                  Gerenciar e monitorar avaliações de projetos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Nova Avaliação
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Estatísticas de Avaliação */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluations.filter(e => e.status === 'CONCLUIDA').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluations.filter(e => e.status === 'PENDENTE').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Nota Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluations.length > 0 
                    ? (evaluations.reduce((acc, e) => acc + e.score, 0) / evaluations.filter(e => e.score > 0).length || 0).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por projeto ou avaliador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os status</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="CONCLUIDA">Concluídas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Avaliações */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Avaliações ({evaluations.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando avaliações...</p>
            </div>
          ) : evaluations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projeto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avaliador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota
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
                  {evaluations.map((evaluation) => (
                    <tr key={evaluation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {evaluation.project.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Categoria {evaluation.project.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {evaluation.evaluator.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                          {evaluation.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {evaluation.score > 0 ? (
                            <>
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm font-medium text-gray-900">
                                {evaluation.score.toFixed(1)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(evaluation.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Ver Detalhes
                        </button>
                        {evaluation.status === 'PENDENTE' && (
                          <button className="text-green-600 hover:text-green-900">
                            Iniciar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma avaliação encontrada
              </h3>
              <p className="text-gray-600">
                Comece criando uma nova avaliação para um projeto.
              </p>
            </div>
          )}
        </div>

        {/* Informações do Sistema de Avaliação */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Sistema de Avaliação FEBIC
              </h3>
              <div className="text-blue-800 text-sm space-y-1">
                <p>• Critérios baseados nos padrões CNPq de avaliação científica</p>
                <p>• Escala de 0 a 10 pontos com 11 critérios específicos</p>
                <p>• Avaliação dupla-cega para garantir imparcialidade</p>
                <p>• Relatórios detalhados para feedback aos participantes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminEvaluations;