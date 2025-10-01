import React from 'react';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';
import { Card } from '../ui/card';

interface CoordinatorStats {
  totalProjects: number;
  projectsSubmitted: number;
  projectsInReview: number;
  totalEvaluators: number;
  activeEvaluators: number;
  pendingEvaluations: number;
  completedEvaluations: number;
}

interface DistributionStatsProps {
  stats: CoordinatorStats;
  loading?: boolean;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ icon, title, value, subtitle, color, trend }) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${!trend.isPositive && 'rotate-180'}`} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export const DistributionStats: React.FC<DistributionStatsProps> = ({ 
  stats, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const completionRate = stats.totalProjects > 0 
    ? Math.round((stats.completedEvaluations / (stats.totalProjects * 3)) * 100)
    : 0;

  const evaluatorUtilization = stats.totalEvaluators > 0
    ? Math.round((stats.activeEvaluators / stats.totalEvaluators) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Estatísticas Gerais</h2>
        <p className="text-gray-600 mt-1">Visão geral do sistema de avaliações</p>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projetos Totais */}
        <StatCard
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          title="Total de Projetos"
          value={stats.totalProjects}
          subtitle="Projetos cadastrados"
          color="bg-blue-100"
        />

        {/* Projetos Submetidos */}
        <StatCard
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          title="Em Avaliação"
          value={stats.projectsInReview}
          subtitle={`${stats.projectsSubmitted} submetidos`}
          color="bg-yellow-100"
        />

        {/* Avaliadores */}
        <StatCard
          icon={<Users className="w-6 h-6 text-purple-600" />}
          title="Avaliadores"
          value={stats.totalEvaluators}
          subtitle={`${stats.activeEvaluators} ativos (${evaluatorUtilization}%)`}
          color="bg-purple-100"
        />

        {/* Avaliações Pendentes */}
        <StatCard
          icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
          title="Avaliações Pendentes"
          value={stats.pendingEvaluations}
          subtitle="Aguardando conclusão"
          color="bg-orange-100"
        />

        {/* Avaliações Completas */}
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          title="Avaliações Completas"
          value={stats.completedEvaluations}
          subtitle={`Taxa de conclusão: ${completionRate}%`}
          color="bg-green-100"
        />

        {/* Card de Progresso */}
        <Card className="p-6 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progresso das Avaliações
          </h3>
          <div className="space-y-4">
            {/* Barra de Progresso - Completas */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Avaliações Completas</span>
                <span className="font-semibold text-green-600">
                  {stats.completedEvaluations} ({completionRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* Barra de Progresso - Pendentes */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Avaliações Pendentes</span>
                <span className="font-semibold text-orange-600">
                  {stats.pendingEvaluations} ({100 - completionRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${100 - completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* Barra de Progresso - Utilização de Avaliadores */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Utilização de Avaliadores</span>
                <span className="font-semibold text-purple-600">
                  {stats.activeEvaluators}/{stats.totalEvaluators} ({evaluatorUtilization}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${evaluatorUtilization}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};