// frontend/src/components/evaluator/EvaluatorApplicationModal.tsx
import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

interface EvaluatorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EvaluatorApplicationModal: React.FC<EvaluatorApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    motivation: '',
    experience: '',
    expertise: '',
    categories: [] as string[],
    areasOfKnowledge: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'I', label: 'Categoria I - Educação Infantil (Pré I e Pré II)' },
    { id: 'II', label: 'Categoria II - Ensino Fundamental (1º ao 6º ano)' },
    { id: 'III', label: 'Categoria III - Ensino Fundamental (7º ao 9º ano)' },
    { id: 'IV', label: 'Categoria IV - Ensino Técnico Subsequente' },
    { id: 'V', label: 'Categoria V - Educação de Jovens e Adultos' },
    { id: 'VI', label: 'Categoria VI - Ensino Médio/Profissionalizante' },
    { id: 'VII', label: 'Categoria VII - Ensino Superior' },
    { id: 'VIII', label: 'Categoria VIII - Pós-graduação' },
    { id: 'RELATO', label: 'Relato de Experiência Científico-Pedagógica' }
  ];

  const knowledgeAreas = [
    'Ciências Exatas e da Terra',
    'Ciências Biológicas',
    'Engenharias',
    'Ciências da Saúde',
    'Ciências Agrárias',
    'Ciências Sociais Aplicadas',
    'Ciências Humanas',
    'Linguística, Letras e Artes',
    'Multidisciplinar'
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(id => id !== categoryId)
      }));
    }
  };

  const handleAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        areasOfKnowledge: [...prev.areasOfKnowledge, area]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        areasOfKnowledge: prev.areasOfKnowledge.filter(a => a !== area)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
      setError('Selecione pelo menos uma categoria para avaliar');
      return;
    }

    if (formData.areasOfKnowledge.length === 0) {
      setError('Selecione pelo menos uma área de conhecimento');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/evaluator/apply', formData);
      
      if (response.data.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.data.message || 'Erro ao enviar candidatura');
      }
    } catch (error: any) {
      console.error('Erro ao enviar candidatura:', error);
      setError(error.response?.data?.message || 'Erro ao enviar candidatura');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Candidatar-se a Avaliador
              </h3>
              <p className="text-sm text-gray-600">
                Torne-se um avaliador de projetos da FEBIC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Motivação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Por que você gostaria de ser um avaliador? *
            </label>
            <textarea
              value={formData.motivation}
              onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
              placeholder="Descreva sua motivação para se tornar um avaliador de projetos científicos..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Experiência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experiência em avaliação ou pesquisa científica *
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              placeholder="Descreva sua experiência em pesquisa, orientação ou avaliação científica..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Principais áreas de expertise
            </label>
            <textarea
              value={formData.expertise}
              onChange={(e) => setFormData(prev => ({ ...prev, expertise: e.target.value }))}
              placeholder="Liste suas principais áreas de conhecimento e especialização..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categorias que gostaria de avaliar * (selecione pelo menos uma)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.id)}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">
                      {category.label}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selecionados: {formData.categories.length} categoria(s)
            </p>
          </div>

          {/* Áreas de Conhecimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Áreas de conhecimento * (selecione pelo menos uma)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {knowledgeAreas.map((area) => (
                <label key={area} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.areasOfKnowledge.includes(area)}
                    onChange={(e) => handleAreaChange(area, e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-900">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <p className="font-medium mb-1">Próximos passos:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Sua candidatura será analisada pela equipe administrativa</li>
                  <li>• Você receberá uma resposta por email em até 5 dias úteis</li>
                  <li>• Se aprovado, receberá acesso ao sistema de avaliações</li>
                  <li>• Participará de treinamento sobre critérios de avaliação</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || formData.categories.length === 0 || formData.areasOfKnowledge.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Candidatura'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluatorApplicationModal;