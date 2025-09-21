import React from 'react';
import { Calendar, User, Eye, Edit, Trash2, Send, CheckCircle, XCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Project, 
  PROJECT_CATEGORIES, 
  getProjectStatusInfo, 
  canEditProject, 
  canDeleteProject, 
  canSubmitProject 
} from '../../types/Project';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void; // ✅ CORRIGIDO: string ao invés de number
  onSubmit?: (id: string) => void; // ✅ CORRIGIDO: string ao invés de number
  onUpdateStatus?: (id: string, status: string) => void; // ✅ CORRIGIDO: string ao invés de number
  showActions?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  onUpdateStatus,
  showActions = true
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  // Informações da categoria
  const categoryInfo = PROJECT_CATEGORIES.find(cat => cat.value === project.category);
  const statusInfo = getProjectStatusInfo(project.status);
  
  // Permissões
  const canEdit = canEditProject(project, user?.id);
  const canDelete = canDeleteProject(project, user?.id);
  const canSubmit = canSubmitProject(project, user?.id);
  const canUpdateStatus = isAdmin && project.status === 'SUBMETIDO';
  
  // ✅ CORRIGIDO: Contadores usando as propriedades corretas
  const totalMembers = (project._count?.members || 0) + (project._count?.orientadores || 0);
  
  // Cores do status
  const statusColors = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  // Gerar código do projeto (similar ao sistema real)
  const projectCode = `${project.category}${project.id.toString().slice(-4).padStart(4, '0')}${project.areaConhecimento?.sigla?.slice(-2) || 'XX'}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {projectCode}
            </span>
            {/* ✅ CORRIGIDO: Usando propriedades opcionais com verificação */}
            {project.isCredenciado && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                Credenciado
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {project.title}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {project.owner?.name || 'Não informado'}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(project.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalMembers} {totalMembers === 1 ? 'membro' : 'membros'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[statusInfo.color]
            }`}
          >
            {statusInfo.label}
          </span>
          <span className="text-xs text-gray-500">
            {categoryInfo?.label || `Categoria ${project.category}`}
          </span>
        </div>
      </div>

      {/* Área do Conhecimento */}
      {project.areaConhecimento && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Área do Conhecimento</p>
          <p className="text-sm font-medium text-gray-900">
            {project.areaConhecimento.nome}
          </p>
        </div>
      )}

      {/* Instituição */}
      {project.institution && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Instituição</p>
          <p className="text-sm font-medium text-gray-900">
            {project.institution}
            {project.institutionState && ` - ${project.institutionState}`}
          </p>
          <div className="flex gap-2 mt-1">
            {project.isPublicSchool && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Pública
              </span>
            )}
            {/* ✅ CORRIGIDO: Usando propriedade opcional com verificação */}
            {project.isFullTimeInstitution && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Tempo Integral
              </span>
            )}
          </div>
        </div>
      )}

      {/* Resumo */}
      {project.summary && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.summary}
        </p>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => onView?.(project)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver detalhes
          </button>

          <div className="flex gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar projeto"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {canSubmit && onSubmit && (
              <button
                onClick={() => onSubmit(project.id)} // ✅ CORRIGIDO: project.id é string
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Enviar para avaliação"
              >
                <Send className="w-4 h-4" />
              </button>
            )}

            {canUpdateStatus && onUpdateStatus && (
              <>
                <button
                  onClick={() => onUpdateStatus(project.id, 'APROVADO_CIAS')} // ✅ CORRIGIDO: usando status válido
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Aprovar projeto"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateStatus(project.id, 'REPROVADO_CIAS')} // ✅ CORRIGIDO: usando status válido
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Rejeitar projeto"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(project.id)} // ✅ CORRIGIDO: project.id é string
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir projeto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Link alternativo se não usar callbacks */}
      {!showActions && (
        <div className="pt-4 border-t border-gray-100">
          <Link
            to={`/projects/${project.id}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver projeto
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;