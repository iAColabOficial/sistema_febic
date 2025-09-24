import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Download, Calendar, Filter,
  Users, FileText, CheckCircle, Clock, ArrowLeft,
  PieChart, Activity, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface StatsData {
  users: {
    total: number;
    byRole: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
  };
  projects: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
    topAreas: Array<{
      areaConhecimentoId: string;
      _count: number;
      area?: { nome: string; sigla: string };
    }>;
  };
}

const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type: string) => {
    // Implementar exportação
    console.log(`Exportando relatório: ${type}`);
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
                  Relatórios do Sistema
                </h1>
                <p className="text-sm text-gray-500">
                  Análises detalhadas e estatísticas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="1m">Último mês</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último ano</option>
              </select>
              <button 
                onClick={() => exportReport('geral')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Resumo Executivo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.users.total || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">
                +12% este mês
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Projetos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.projects.total || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">
                +8% este mês
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? Math.round((stats.projects.byStatus.APROVADO_CIAS || 0) / stats.projects.total * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-yellow-600">
                -2% este mês
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.projects.byStatus.SUBMETIDO || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-red-600">
                +5 esta semana
              </span>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Projetos por Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Projetos por Status
              </h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {stats && Object.entries(stats.projects.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">{status}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {count} ({Math.round(count / stats.projects.total * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Projetos por Categoria */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Projetos por Categoria
              </h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {stats && Object.entries(stats.projects.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categoria {category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(count / stats.projects.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Áreas de Conhecimento Mais Populares */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Top 10 Áreas de Conhecimento
            </h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.projects.topAreas.slice(0, 10).map((item, index) => (
              <div key={item.areaConhecimentoId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.area?.nome || 'Área não identificada'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.area?.sigla}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item._count} projetos
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações de Relatório */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Exportar Relatórios Específicos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => exportReport('usuarios')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Relatório de Usuários</h4>
              <p className="text-sm text-gray-600">Lista completa com dados pessoais</p>
            </button>
            
            <button 
              onClick={() => exportReport('projetos')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <FileText className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Relatório de Projetos</h4>
              <p className="text-sm text-gray-600">Todos os projetos com detalhes</p>
            </button>
            
            <button 
              onClick={() => exportReport('atividades')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Activity className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Log de Atividades</h4>
              <p className="text-sm text-gray-600">Histórico de ações no sistema</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;