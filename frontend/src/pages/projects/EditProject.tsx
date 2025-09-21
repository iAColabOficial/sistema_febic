import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Loader,
  Home,
  FileText
} from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Project } from '@/types/Project';
import { useAuth } from '@/contexts/AuthContext';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    objective: '',
    methodology: '',
    results: '',
    conclusion: '',
    bibliography: '',
    keywords: [] as string[]
  });

  // Carregar dados do projeto
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        toast.error('ID do projeto não encontrado');
        navigate('/projects');
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/projects/${id}`);
        
        if (response.data.success) {
          const projectData = response.data.data;
          
          // Verificar se o usuário pode editar este projeto
          if (projectData.ownerId !== user?.id) {
            toast.error('Você não tem permissão para editar este projeto');
            navigate('/projects');
            return;
          }

          setProject(projectData);
          setFormData({
            title: projectData.title || '',
            summary: projectData.summary || '',
            objective: projectData.objective || '',
            methodology: projectData.methodology || '',
            results: projectData.results || '',
            conclusion: projectData.conclusion || '',
            bibliography: projectData.bibliography || '',
            keywords: projectData.keywords || []
          });
        } else {
          toast.error('Erro ao carregar projeto');
          navigate('/projects');
        }
      } catch (error: any) {
        console.error('Erro ao carregar projeto:', error);
        toast.error('Erro ao carregar projeto');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate, user?.id]);

  // Atualizar projeto
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project) return;

    try {
      setUpdating(true);
      const response = await api.put(`/projects/${project.id}`, formData);
      
      if (response.data.success) {
        toast.success('Projeto atualizado com sucesso!');
        navigate('/projects');
      } else {
        toast.error(response.data.message || 'Erro ao atualizar projeto');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar projeto:', error);
      toast.error('Erro ao atualizar projeto');
    } finally {
      setUpdating(false);
    }
  };

  // Adicionar palavra-chave
  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const keyword = e.currentTarget.value.trim();
      if (keyword && !formData.keywords.includes(keyword)) {
        setFormData(prev => ({
          ...prev,
          keywords: [...prev.keywords, keyword]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  // Remover palavra-chave
  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="h-5 w-5 animate-spin" />
          Carregando projeto...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Projeto não encontrado
          </h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-blue-600 hover:text-blue-700"
          >
            Voltar para projetos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar para Projetos
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Editar Projeto
                  </h1>
                  <p className="text-sm text-gray-600">
                    Categoria {project.category} • Status: {project.status}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleUpdateProject} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Título */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Projeto *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Resumo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resumo *
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Objetivo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo *
              </label>
              <textarea
                value={formData.objective}
                onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Metodologia */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodologia *
              </label>
              <textarea
                value={formData.methodology}
                onChange={(e) => setFormData(prev => ({ ...prev, methodology: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Resultados */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultados
              </label>
              <textarea
                value={formData.results}
                onChange={(e) => setFormData(prev => ({ ...prev, results: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Conclusão */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conclusão
              </label>
              <textarea
                value={formData.conclusion}
                onChange={(e) => setFormData(prev => ({ ...prev, conclusion: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bibliografia */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bibliografia
              </label>
              <textarea
                value={formData.bibliography}
                onChange={(e) => setFormData(prev => ({ ...prev, bibliography: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lista das referências utilizadas"
              />
            </div>

            {/* Palavras-chave */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palavras-chave
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyPress={addKeyword}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite uma palavra-chave e pressione Enter"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={updating}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;