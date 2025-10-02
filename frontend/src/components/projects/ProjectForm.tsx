import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { CreateProjectData, UpdateProjectData, PROJECT_CATEGORIES, Project } from '../../types/Project';
import { FeiraCredencialSelector } from './FeiraCredencialSelector';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  project, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const isEditing = !!project;
  const [feiraAfiliadaId, setFeiraAfiliadaId] = useState<string | null>(
    project?.feiraAfiliadaId || null
  );
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateProjectData>({
    defaultValues: isEditing ? {
      title: project.title,
      category: project.category,
      summary: project.summary,
      objective: project.objective,
      methodology: project.methodology,
      areaConhecimentoId: project.areaConhecimentoId,
      institution: project.institution,
      institutionCity: project.institutionCity,
      institutionState: project.institutionState,
    } : {
      title: '',
      category: '',
      summary: '',
      objective: '',
      methodology: '',
      areaConhecimentoId: '',
      institution: '',
      institutionCity: '',
      institutionState: '',
    }
  });

  const watchedSummary = watch('summary', '');

  const onFormSubmit = async (data: CreateProjectData) => {
    // Adiciona feiraAfiliadaId aos dados se selecionado
    const submitData = {
      ...data,
      ...(feiraAfiliadaId && { feiraAfiliadaId })
    };
    
    await onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Feira Credencial - NOVO */}
            {!isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <FeiraCredencialSelector
                  value={feiraAfiliadaId || undefined}
                  onChange={setFeiraAfiliadaId}
                />
              </div>
            )}

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Projeto *
              </label>
              <input
                type="text"
                {...register('title', {
                  required: 'Título é obrigatório',
                  minLength: { value: 10, message: 'Título deve ter pelo menos 10 caracteres' },
                  maxLength: { value: 500, message: 'Título deve ter no máximo 500 caracteres' }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o título do seu projeto"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                {...register('category', { required: 'Categoria é obrigatória' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {PROJECT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Resumo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resumo do Projeto *
              </label>
              <textarea
                {...register('summary', {
                  required: 'Resumo é obrigatório',
                  minLength: { value: 50, message: 'Resumo deve ter pelo menos 50 caracteres' },
                  maxLength: { value: 3000, message: 'Resumo deve ter no máximo 3000 caracteres' }
                })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descreva seu projeto de forma detalhada..."
              />
              <div className="flex justify-between items-center mt-2">
                {errors.summary && (
                  <p className="text-red-600 text-sm">{errors.summary.message}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {watchedSummary?.length || 0}/3000
                </p>
              </div>
            </div>

            {/* Objetivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo *
              </label>
              <textarea
                {...register('objective', { 
                  required: 'Objetivo é obrigatório',
                  minLength: { value: 20, message: 'Objetivo deve ter pelo menos 20 caracteres' }
                })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descreva o objetivo principal do projeto..."
              />
              {errors.objective && (
                <p className="text-red-600 text-sm mt-1">{errors.objective.message}</p>
              )}
            </div>

            {/* Metodologia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodologia *
              </label>
              <textarea
                {...register('methodology', { 
                  required: 'Metodologia é obrigatória',
                  minLength: { value: 20, message: 'Metodologia deve ter pelo menos 20 caracteres' }
                })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descreva a metodologia utilizada no projeto..."
              />
              {errors.methodology && (
                <p className="text-red-600 text-sm mt-1">{errors.methodology.message}</p>
              )}
            </div>

            {/* Área do Conhecimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área do Conhecimento *
              </label>
              <select
                {...register('areaConhecimentoId', { required: 'Área do conhecimento é obrigatória' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione a área do conhecimento</option>
                <option value="1">Ciências Exatas e da Terra</option>
                <option value="2">Ciências Biológicas</option>
                <option value="3">Engenharias</option>
                <option value="4">Ciências da Saúde</option>
                <option value="5">Ciências Agrárias</option>
                <option value="6">Ciências Sociais Aplicadas</option>
                <option value="7">Ciências Humanas</option>
                <option value="8">Linguística, Letras e Artes</option>
                <option value="9">Outros</option>
              </select>
              {errors.areaConhecimentoId && (
                <p className="text-red-600 text-sm mt-1">{errors.areaConhecimentoId.message}</p>
              )}
            </div>

            {/* Instituição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instituição *
              </label>
              <input
                type="text"
                {...register('institution', { required: 'Instituição é obrigatória' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome da escola/universidade"
              />
              {errors.institution && (
                <p className="text-red-600 text-sm mt-1">{errors.institution.message}</p>
              )}
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  {...register('institutionCity', { required: 'Cidade é obrigatória' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cidade da instituição"
                />
                {errors.institutionCity && (
                  <p className="text-red-600 text-sm mt-1">{errors.institutionCity.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <input
                  type="text"
                  {...register('institutionState', { required: 'Estado é obrigatório' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="UF"
                  maxLength={2}
                />
                {errors.institutionState && (
                  <p className="text-red-600 text-sm mt-1">{errors.institutionState.message}</p>
                )}
              </div>
            </div>

            {/* Aviso para edição */}
            {isEditing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Atenção:</strong> Apenas projetos em rascunho podem ser editados. 
                      {project?.status !== 'RASCUNHO' && ' Este projeto não pode mais ser modificado.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || (isEditing && project?.status !== 'RASCUNHO')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading 
                  ? (isEditing ? 'Atualizando...' : 'Salvando...')
                  : (isEditing ? 'Atualizar Projeto' : 'Criar Projeto')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;