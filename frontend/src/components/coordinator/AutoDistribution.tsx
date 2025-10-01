import React, { useState, useEffect } from 'react';
import {
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Play,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import api from '../../services/api';

interface AutoDistributionStats {
  projectsNeedingDistribution: number;
  availableEvaluators: number;
  estimatedDistributions: number;
  canDistribute: boolean;
  reason?: string;
}

interface DistributionResult {
  success: boolean;
  message: string;
  distributed: number;
  failed: number;
  details?: Array<{
    projectId: string;
    projectTitle: string;
    evaluatorsAssigned: number;
    evaluatorNames: string[];
  }>;
}

interface AutoDistributionProps {
  onDistributionComplete?: () => void;
}

export const AutoDistribution: React.FC<AutoDistributionProps> = ({
  onDistributionComplete
}) => {
  const [stats, setStats] = useState<AutoDistributionStats | null>(null);
  const [result, setResult] = useState<DistributionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Configurações da distribuição automática
  const [maxProjectsPerEvaluator, setMaxProjectsPerEvaluator] = useState(10);
  const [evaluatorsPerProject, setEvaluatorsPerProject] = useState(3);
  const [balanceWorkload, setBalanceWorkload] = useState(true);

  // Buscar estatísticas para distribuição automática
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/coordinator/projects/distribution');
      const projectsResponse = response.data;

      const evaluatorsResponse = await api.get('/coordinator/evaluators/available');
      const evaluators = evaluatorsResponse.data;

      // Calcular projetos que precisam de distribuição
      const needingDistribution = projectsResponse.filter(
        (p: any) => p._count.avaliacoes < 3
      ).length;

      // Calcular avaliadores disponíveis (com capacidade)
      const availableEvals = evaluators.filter(
        (e: any) => e._count.avaliacoes < maxProjectsPerEvaluator
      ).length;

      const canDistribute = needingDistribution > 0 && availableEvals > 0;
      const estimatedDistributions = Math.min(
        needingDistribution * evaluatorsPerProject,
        availableEvals * maxProjectsPerEvaluator
      );

      setStats({
        projectsNeedingDistribution: needingDistribution,
        availableEvaluators: availableEvals,
        estimatedDistributions: Math.floor(estimatedDistributions / evaluatorsPerProject),
        canDistribute,
        reason: !canDistribute
          ? needingDistribution === 0
            ? 'Todos os projetos já estão distribuídos'
            : 'Não há avaliadores disponíveis'
          : undefined
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [maxProjectsPerEvaluator]);

  // Executar distribuição automática
  const handleAutoDistribute = async () => {
    try {
      setDistributing(true);
      setError(null);
      setResult(null);

      const response = await api.post('/coordinator/distribute/auto', {
        maxProjectsPerEvaluator,
        evaluatorsPerProject,
        balanceWorkload
      });

      setResult(response.data);
      
      // Atualizar estatísticas
      await fetchStats();

      if (onDistributionComplete) {
        onDistributionComplete();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao executar distribuição automática');
    } finally {
      setDistributing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-7 h-7 text-yellow-500" />
          Distribuição Automática
        </h2>
        <p className="text-gray-600 mt-1">
          Distribua projetos automaticamente de forma inteligente e balanceada
        </p>
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Como funciona a distribuição automática?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Projetos são distribuídos priorizando aqueles com menos avaliadores</li>
              <li>Carga de trabalho é balanceada entre todos os avaliadores disponíveis</li>
              <li>Evita conflitos de interesse (avaliadores não avaliam seus próprios projetos)</li>
              <li>Respeita o limite máximo de projetos por avaliador</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Mensagem de Erro */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Erro na Distribuição</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Resultado da Distribuição */}
      {result && (
        <Card className={`p-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'Distribuição Concluída!' : 'Distribuição Falhou'}
              </h3>
              <p className={`text-sm mt-1 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </p>
              
              {result.success && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-gray-600">Distribuições Realizadas</p>
                    <p className="text-2xl font-bold text-green-600">{result.distributed}</p>
                  </div>
                  {result.failed > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <p className="text-sm text-gray-600">Falhas</p>
                      <p className="text-2xl font-bold text-orange-600">{result.failed}</p>
                    </div>
                  )}
                </div>
              )}

              {result.details && result.details.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {showDetails ? 'Ocultar' : 'Ver'} Detalhes da Distribuição
                  </button>

                  {showDetails && (
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      {result.details.map((detail, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="font-medium text-gray-900 text-sm">{detail.projectTitle}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {detail.evaluatorNames.map((name, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <Card className="lg:col-span-1 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
            </div>

            {/* Máximo de Projetos por Avaliador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Projetos por Avaliador
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxProjectsPerEvaluator}
                onChange={(e) => setMaxProjectsPerEvaluator(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Limite de projetos que cada avaliador pode receber
              </p>
            </div>

            {/* Avaliadores por Projeto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliadores por Projeto
              </label>
              <select
                value={evaluatorsPerProject}
                onChange={(e) => setEvaluatorsPerProject(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 avaliador</option>
                <option value={2}>2 avaliadores</option>
                <option value={3}>3 avaliadores</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Número de avaliadores a serem atribuídos a cada projeto
              </p>
            </div>

            {/* Balancear Carga */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="balanceWorkload"
                checked={balanceWorkload}
                onChange={(e) => setBalanceWorkload(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="balanceWorkload" className="text-sm text-gray-700 cursor-pointer">
                <span className="font-medium">Balancear carga de trabalho</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribui projetos de forma equilibrada entre avaliadores
                </p>
              </label>
            </div>

            {/* Botão Atualizar Stats */}
            <Button
              onClick={fetchStats}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Atualizar Estimativas
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Estatísticas e Ação */}
        <Card className="lg:col-span-2 p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              Análise de Distribuição
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : stats ? (
              <>
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Projetos Precisando Distribuição */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 font-medium">
                          Projetos Pendentes
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {stats.projectsNeedingDistribution}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Avaliadores Disponíveis */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-700 font-medium">
                          Avaliadores
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {stats.availableEvaluators}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Distribuições Estimadas */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-700 font-medium">
                          Estimativa
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {stats.estimatedDistributions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status da Distribuição */}
                {!stats.canDistribute && stats.reason && (
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">
                          Distribuição não disponível
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          {stats.reason}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Botão de Ação */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleAutoDistribute}
                    disabled={distributing || !stats.canDistribute}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold"
                  >
                    {distributing ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Distribuindo Automaticamente...
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-3" />
                        Iniciar Distribuição Automática
                      </>
                    )}
                  </Button>

                  {stats.canDistribute && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Aproximadamente {stats.estimatedDistributions} projeto(s) serão distribuídos
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
};