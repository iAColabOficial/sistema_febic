import React from 'react';
import { 
  Eye, 
  FileText, 
  Clock, 
  CheckCircle, 
  Users, 
  MapPin, 
  Calendar,
  Star,
  AlertTriangle
} from 'lucide-react';

interface ProjectEvaluationCardProps {
  evaluation: {
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
  };
  onViewDetails: () => void;
  onStartEvaluation: () => void;
  compact?: boolean;
}

const ProjectEvaluationCard: React.FC<ProjectEvaluationCardProps> = ({
  evaluation,
  onViewDetails,
  onStartEvaluation,
  compact = false
}) => {
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
      'RELATO': 'Relato de Experiência'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'I': 'bg-pink-100 text-pink-800',
      'II': 'bg-purple-100 text-purple-800',
      'III': 'bg-blue-100 text-blue-800',
      'IV': 'bg-indigo-100 text-indigo-800',
      'V': 'bg-green-100 text-green-800',
      'VI': 'bg-yellow-100 text-yellow-800',
      'VII': 'bg-orange-100 text-orange-800',
      'VIII': 'bg-red-100 text-red-800',
      'RELATO': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusInfo = () => {
    if (evaluation.isCompleted) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Avaliação Concluída',
        color: 'text-green-600 bg-green-50 border-green-200',
        badge: 'bg-green-100 text-green-800'
      };
    }
    
    return {
      icon: <Clock className="w-4 h-4" />,
      text: 'Avaliação Pendente',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      badge: 'bg-orange-100 text-orange-800'
    };
  };

  const getPriorityLevel = () => {
    if (evaluation.isCompleted) return null;
    
    // Lógica simples de prioridade baseada no tempo
    const now = new Date();
    const created = new Date(); // Você pode passar createdAt como prop
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 7) {
      return {
        level: 'high',
        text: 'Alta Prioridade',
        color: 'text-red-600',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else if (daysDiff > 3) {
      return {
        level: 'medium', 
        text: 'Prioridade Média',
        color: 'text-yellow-600',
        icon: <Clock className="w-4 h-4" />
      };
    }
    
    return null;
  };

  const statusInfo = getStatusInfo();
  const priority = getPriorityLevel();

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate mr-2">
                {evaluation.project.title}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                {statusInfo.icon}
                <span className="ml-1">{evaluation.isCompleted ? 'Concluída' : 'Pendente'}</span>
              </span>
            </div>
            
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <span>{getCategoryName(evaluation.project.category)}</span>
              <span>•</span>
              <span>{evaluation.project.owner.name}</span>
              {evaluation.notaFinal && (
                <>
                  <span>•</span>
                  <span className="font-medium text-blue-600">
                    Nota: {evaluation.notaFinal.toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={onViewDetails}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Ver detalhes"
            >
              <Eye className="w-4 h-4" />
            </button>
            {!evaluation.isCompleted && (
              <button
                onClick={onStartEvaluation}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Avaliar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${
      evaluation.isCompleted ? 'border-l-green-500' : 'border-l-orange-500'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold text-gray-900 mr-3">
                {evaluation.project.title}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </span>
              {priority && (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-2 ${priority.color}`}>
                  {priority.icon}
                  <span className="ml-1">{priority.text}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(evaluation.project.category)}`}>
                {getCategoryName(evaluation.project.category)}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {evaluation.project.areaConhecimento.nome}
              </span>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-2">
              {evaluation.project.summary}
            </p>
          </div>
          
          {evaluation.notaFinal && (
            <div className="ml-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-2">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Nota Final</p>
              <p className="text-2xl font-bold text-blue-600">
                {evaluation.notaFinal.toFixed(1)}
              </p>
            </div>
          )}
        </div>

        {/* Informações do Projeto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span><strong>Autor:</strong> {evaluation.project.owner.name}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              <span><strong>Orientador:</strong> {evaluation.project.orientadores[0]?.name || 'N/A'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span><strong>Membros:</strong> {evaluation.project.membersCount} pessoa(s)</span>
            </div>
            {evaluation.project.orientadores[0]?.institution && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span><strong>Instituição:</strong> {evaluation.project.orientadores[0].institution}</span>
              </div>
            )}
          </div>
        </div>

        {/* Data de conclusão */}
        {evaluation.completedAt && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Avaliada em: {new Date(evaluation.completedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onViewDetails}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </button>
          
          {!evaluation.isCompleted ? (
            <button
              onClick={onStartEvaluation}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Avaliar Projeto
            </button>
          ) : (
            <button
              onClick={onViewDetails}
              className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Ver Avaliação
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEvaluationCard;