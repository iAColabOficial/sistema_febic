import React, { useState, useEffect } from 'react';
import { X, Save, FileText, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { Project } from '../../types/Project';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
}

interface AreaConhecimento {
  id: string;
  nome: string;
  sigla: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  project, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'RASCUNHO',
    category: 'CATEGORIA_1',
    areaConhecimentoId: '',
    keywords: '',
    objectives: '',
    methodology: ''
  });
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<AreaConhecimento[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Carregar áreas de conhecimento
  useEffect(() => {
    if (isOpen) {
      loadAreas();
    }
  }, [isOpen]);

  // Preencher formulário quando o projeto mudar
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'RASCUNHO',
        category: project.category || 'CATEGORIA_1',
        areaConhecimentoId: project.areaConhecimentoId || '',
        keywords: project.keywords || '',
        objectives: project.objectives || '',
        methodology: project.methodology || ''
      });
    }
  }, [project]);

  const loadAreas = async () => {
    try {
      setLoadingAreas(true);
      const response = await api.get('/projects/areas/principais');
      if (response.data.success) {
        setAreas(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar áreas:', error);
    } finally {
      setLoadingAreas(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setLoading(true);

    try {
      const response = await api.put(`/admin/projects/${project.id}`, formData);
      if (response.data.success) {
        onSave(response.data.data);
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar projeto:', error);
      alert(error.response?.data?.message || 'Erro ao atualizar projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'RASCUNHO', label: 'Rascunho', color: 'gray' },
    { value: 'SUBMETIDO', label: 'Submetido', color: 'blue' },
    { value: 'EM_AVALIACAO', label: 'Em Avaliação', color: 'yellow' },
    { value: 'APROVADO_CIAS', label: 'Aprovado CIAS', color: 'green' },
    { value: 'REPROVADO_CIAS', label: 'Reprovado CIAS', color: 'red' },
    { value: 'FINALISTA_PRESENCIAL', label: 'Finalista Presencial', color: 'purple' },
    { value: 'PREMIADO', label: 'Premiado', color: 'yellow' }
  ];

  const categoryOptions = [
    { value: 'CATEGORIA_1', label: 'Categoria 1 (6º e 7º ano)' },
    { value: 'CATEGORIA_2', label: 'Categoria 2 (8º e 9º ano)' },
    { value: 'CATEGORIA_3', label: 'Categoria 3 (Ensino Médio)' },
    { value: 'CATEGORIA_4', label: 'Categoria 4 (Técnico/Superior)' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Editar Projeto: {project?.title}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Informações Básicas
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Projeto *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o projeto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área de Conhecimento *
                </label>
                <select
                  value={formData.areaConhecimentoId}
                  onChange={(e) => handleInputChange('areaConhecimentoId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingAreas}
                >
                  <option value="">Selecione uma área...</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.sigla} - {area.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Detalhes do Projeto */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Detalhes do Projeto
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palavras-chave
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Separe as palavras-chave por vírgula..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivos
              </label>
              <textarea
                value={formData.objectives}
                onChange={(e) => handleInputChange('objectives', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva os objetivos do projeto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodologia
              </label>
              <textarea
                value={formData.methodology}
                onChange={(e) => handleInputChange('methodology', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva a metodologia utilizada..."
              />
            </div>
          </div>

          {/* Informações do Projeto Original */}
          {project && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Projeto</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Autor:</span> {project.owner?.name}
                </div>
                <div>
                  <span className="font-medium">Criado em:</span> {' '}
                  {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">Última atualização:</span> {' '}
                  {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">ID:</span> {project.id}
                </div>
              </div>
            </div>
          )}

          {/* Aviso sobre alterações críticas */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Atenção ao alterar status:</p>
              <p>Mudanças de status podem afetar a visibilidade do projeto para o autor e orientadores. Certifique-se das alterações antes de salvar.</p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;