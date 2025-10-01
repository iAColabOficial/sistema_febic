import React, { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useCoordinator } from '../../hooks/useCoordinator';
import { DistributionStats } from '../../components/coordinator/DistributionStats';
import { Button } from '../../components/ui/button';

export const CoordinatorDashboard: React.FC = () => {
  const { stats, report, loading, error, refreshData } = useCoordinator();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard do Coordenador
              </h1>
              <p className="text-gray-600 mt-1">
                Gerenciamento e distribuição de avaliações
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Erro ao carregar dados</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {stats && (
          <div className="mb-8">
            <DistributionStats stats={stats} loading={loading} />
          </div>
        )}

        {/* Relatório de Distribuição */}
        {report && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Relatório de Distribuição
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Projetos sem avaliadores */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm font-medium text-red-900 mb-1">
                  Sem Avaliadores
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {report.projectsWithoutEvaluators}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Projetos precisam de distribuição
                </p>
              </div>

              {/* Projetos parcialmente distribuídos */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm font-medium text-yellow-900 mb-1">
                  Parcialmente Distribuídos
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {report.projectsPartiallyDistributed}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Precisam de mais avaliadores
                </p>
              </div>

              {/* Projetos totalmente distribuídos */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm font-medium text-green-900 mb-1">
                  Totalmente Distribuídos
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {report.projectsFullyDistributed}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Com 3 avaliadores cada
                </p>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Avaliadores Disponíveis
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {report.evaluatorsWithoutProjects}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Média de Projetos por Avaliador
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {report.averageProjectsPerEvaluator?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>

            {/* Tabela de Carga de Trabalho */}
            {report.evaluatorWorkload && report.evaluatorWorkload.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Carga de Trabalho dos Avaliadores
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avaliador
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Projetos Atribuídos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avaliações Completas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avaliações Pendentes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progresso
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.evaluatorWorkload.map((evaluator) => {
                        const progress = evaluator.assignedProjects > 0
                          ? Math.round((evaluator.completedEvaluations / evaluator.assignedProjects) * 100)
                          : 0;
                        
                        return (
                          <tr key={evaluator.evaluatorId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {evaluator.evaluatorName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {evaluator.assignedProjects}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600 font-medium">
                                {evaluator.completedEvaluations}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-orange-600 font-medium">
                                {evaluator.pendingEvaluations}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {progress}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado de Loading */}
        {loading && !stats && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};