import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowLeft, Home } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../contexts/AuthContext';
import ProjectCard from '../../components/projects/ProjectCard';
import CreateProject from './CreateProject';
import ProjectDetailModal from '../../components/projects/ProjectModal';
import Loading from '../../components/ui/loading';
import { 
  Project, 
  CreateProjectData, 
  PROJECT_CATEGORIES, 
  PROJECT_STATUS,
  ProjectFilters,    // âœ… Adicionado
  ProjectStatus,     // âœ… Adicionado  
  ProjectCategory    // âœ… Adicionado
} from '../../types/Project';

const ProjectsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // âœ… CORRIGIDO: Tipagem correta do filters
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: undefined,    // âœ… ProjectStatus | undefined
    category: undefined   // âœ… ProjectCategory | undefined
  });

  const {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    submitProject,
    updateProjectStatus,
    refetch
  } = useProjects(filters.search || filters.status || filters.category ? filters : undefined);

  const handleCreateProject = async (data: CreateProjectData) => {
    await createProject(data);
    setShowCreateForm(false);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleEditProject = (project: Project) => {
    // Navegar para pÃ¡gina de ediÃ§Ã£o
    navigate(`/projects/edit/${project.id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      await deleteProject(id);
    }
  };

  const handleSubmitProject = async (id: string) => {
    if (window.confirm('Tem certeza que deseja enviar este projeto para avaliaÃ§Ã£o?')) {
      await submitProject(id);
      setSelectedProject(null);
    }
  };

  const handleUpdateProjectStatus = async (id: string, status: string) => {
    const action = status === 'APROVADO_CIAS' ? 'aprovar' : 'desclassificar'; // âœ… CORRIGIDO: status vÃ¡lido
    if (window.confirm(`Tem certeza que deseja ${action} este projeto?`)) {
      await updateProjectStatus(id, status);
      setSelectedProject(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar ao Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.role === 'ADMINISTRADOR' ? 'Todos os Projetos' : 'Meus Projetos'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {projects.length} projeto{projects.length !== 1 ? 's' : ''} encontrado{projects.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-3 py-2"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
              
              {user?.role === 'AUTOR' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Projeto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''} // âœ… CORRIGIDO: Tratar undefined
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar projetos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''} // âœ… CORRIGIDO: Tratar undefined
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value ? e.target.value as ProjectStatus : undefined // âœ… CORRIGIDO: Casting correto
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                {PROJECT_STATUS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filters.category || ''} // âœ… CORRIGIDO: Tratar undefined
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  category: e.target.value ? e.target.value as ProjectCategory : undefined // âœ… CORRIGIDO: Casting correto
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as categorias</option>
                {PROJECT_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">ðŸ“„</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'AUTOR' 
                ? 'Comece criando seu primeiro projeto!'
                : 'Nenhum projeto corresponde aos filtros selecionados.'
              }
            </p>
            {user?.role === 'AUTOR' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Primeiro Projeto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onSubmit={handleSubmitProject}
                onUpdateStatus={handleUpdateProjectStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateProject
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={handleEditProject}
          onSubmit={handleSubmitProject}
          onUpdateStatus={handleUpdateProjectStatus}
        />
      )}
    </div>
  );
};

export default ProjectsList;