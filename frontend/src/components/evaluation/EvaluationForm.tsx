import React, { useState, useEffect } from 'react';
import { Save, Send, ArrowLeft, FileText, Users, Calendar, MapPin } from 'lucide-react';

interface EvaluationData {
  id: string;
  notaInovacao?: number;
  notaMetodologia?: number;
  notaRelevancia?: number;
  notaApresentacao?: number;
  notaImpacto?: number;
  notaViabilidade?: number;
  comentarioGeral?: string;
  pontosFortes?: string;
  pontosMelhoria?: string;
  sugestoes?: string;
  isCompleted: boolean;
  project: {
    id: string;
    title: string;
    summary: string;
    objective: string;
    methodology: string;
    results?: string;
    conclusion?: string;
    category: string;
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
    members: Array<{
      name: string;
      schoolLevel: string;
    }>;
    documents: Array<{
      id: string;
      name: string;
      filePath: string;
      mimeType: string;
    }>;
  };
}

interface EvaluationFormProps {
  evaluationId: string;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ evaluationId }) => {
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    notaInovacao: '',
    notaMetodologia: '',
    notaRelevancia: '',
    notaApresentacao: '',
    notaImpacto: '',
    notaViabilidade: '',
    comentarioGeral: '',
    pontosFortes: '',
    pontosMelhoria: '',
    sugestoes: ''
  });

  useEffect(() => {
    fetchEvaluation();
  }, [evaluationId]);

  const fetchEvaluation = async () => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar avaliação');
      }

      const data = await response.json();
      setEvaluation(data);
      
      // Preencher formulário com dados existentes
      setFormData({
        notaInovacao: data.notaInovacao?.toString() || '',
        notaMetodologia: data.notaMetodologia?.toString() || '',
        notaRelevancia: data.notaRelevancia?.toString() || '',
        notaApresentacao: data.notaApresentacao?.toString() || '',
        notaImpacto: data.notaImpacto?.toString() || '',
        notaViabilidade: data.notaViabilidade?.toString() || '',
        comentarioGeral: data.comentarioGeral || '',
        pontosFortes: data.pontosFortes || '',
        pontosMelhoria: data.pontosMelhoria || '',
        sugestoes: data.sugestoes || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['notaInovacao', 'notaMetodologia', 'notaRelevancia'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      setError('Preencha todas as notas obrigatórias (Inovação, Metodologia e Relevância)');
      return false;
    }

    // Validar se as notas estão entre 0 e 10
    const noteFields = ['notaInovacao', 'notaMetodologia', 'notaRelevancia', 'notaApresentacao', 'notaImpacto', 'notaViabilidade'];
    for (const field of noteFields) {
      const value = formData[field as keyof typeof formData];
      if (value && (parseFloat(value) < 0 || parseFloat(value) > 10)) {
        setError('As notas devem estar entre 0 e 10');
        return false;
      }
    }

    return true;
  };

  const saveEvaluation = async (complete = false) => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        projectId: evaluation?.project.id,
        ...Object.fromEntries(
          Object.entries(formData).map(([key, value]) => [
            key,
            key.startsWith('nota') && value ? parseFloat(value) : value || undefined
          ])
        )
      };

      const response = await fetch(`/api/evaluations/${evaluationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar avaliação');
      }

      if (complete) {
        const completeResponse = await fetch(`/api/evaluations/${evaluationId}/complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!completeResponse.ok) {
          throw new Error('Erro ao finalizar avaliação');
        }

        alert('Avaliação finalizada com sucesso!');
        window.location.href = '/evaluator-dashboard';
      } else {
        alert('Avaliação salva com sucesso!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  };

  const getCriteriaDescription = (category: string) => {
    if (category === 'I' || category === 'II') {
      return {
        inovacao: 'Originalidade da pesquisa e relevância do tema (15%)',
        metodologia: 'Evidência da aplicação do método científico (30%)',
        relevancia: 'Capacidade argumentativa e justificativa (15%)',
        apresentacao: 'Adequação das referências (10%)',
        impacto: 'Objetivo pedagógico estabelecido (20%)',
        viabilidade: 'Clareza na dissertação das ideias (10%)'
      };
    }

    return {
      inovacao: 'Originalidade da pesquisa e relevância do tema (15%)',
      metodologia: 'Evidência da aplicação do método científico (35%)',
      relevancia: 'Capacidade argumentativa e justificativa (15%)',
      apresentacao: 'Clareza na dissertação das ideias (25%)',
      impacto: 'Impacto social/ambiental/econômico (5%)',
      viabilidade: 'Adequação das referências (5%)'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar avaliação</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchEvaluation}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) return null;

  if (evaluation.isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Avaliação Finalizada</h3>
            <p className="text-green-600">Esta avaliação já foi finalizada e não pode ser modificada.</p>
            <button
              onClick={() => window.location.href = '/evaluator-dashboard'}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const criteria = getCriteriaDescription(evaluation.project.category);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.location.href = '/evaluator-dashboard'}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Avaliar Projeto</h1>
            <p className="text-gray-600">Preencha todos os critérios de avaliação</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Informações do Projeto */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Projeto</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{evaluation.project.title}</h3>
              <p className="text-gray-700 mb-4">{evaluation.project.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="flex items-center text-gray-600 mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  <strong>Categoria:</strong> {evaluation.project.category}
                </p>
                <p className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <strong>Área:</strong> {evaluation.project.areaConhecimento.nome}
                </p>
              </div>
              <div>
                <p className="flex items-center text-gray-600 mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  <strong>Autor:</strong> {evaluation.project.owner.name}
                </p>
                <p className="flex items-center text-gray-600 mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  <strong>Orientador:</strong> {evaluation.project.orientadores[0]?.name || 'N/A'}
                </p>
              </div>
            </div>

            {/* Seções do Projeto */}
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Objetivo</h4>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{evaluation.project.objective}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Metodologia</h4>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{evaluation.project.methodology}</p>
              </div>

              {evaluation.project.results && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Resultados</h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{evaluation.project.results}</p>
                </div>
              )}

              {evaluation.project.conclusion && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Conclusão</h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{evaluation.project.conclusion}</p>
                </div>
              )}
            </div>

            {/* Documentos */}
            {evaluation.project.documents.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Documentos do Projeto</h4>
                <div className="space-y-2">
                  {evaluation.project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700 flex-1">{doc.name}</span>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Baixar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulário de Avaliação */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Critérios de Avaliação</h2>

            <div className="space-y-6">
              {/* Notas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota de Inovação * (0-10)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{criteria.inovacao}</p>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.notaInovacao}
                    onChange={(e) => handleInputChange('notaInovacao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota de Metodologia * (0-10)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{criteria.metodologia}</p>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.notaMetodologia}
                    onChange={(e) => handleInputChange('notaMetodologia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota de Relevância * (0-10)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{criteria.relevancia}</p>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.notaRelevancia}
                    onChange={(e) => handleInputChange('notaRelevancia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota de Apresentação (0-10)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{criteria.apresentacao}</p>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.notaApresentacao}
                    onChange={(e) => handleInputChange('notaApresentacao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota de Impacto (0-10)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{criteria.impacto}</p>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.notaImpacto}
                    onChange={(e) => handleInputChange('notaImpacto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota de Viabilidade (0-10)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{criteria.viabilidade}</p>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.notaViabilidade}
                    onChange={(e) => handleInputChange('notaViabilidade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>
              </div>

              {/* Comentários */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentário Geral
                  </label>
                  <textarea
                    rows={4}
                    value={formData.comentarioGeral}
                    onChange={(e) => handleInputChange('comentarioGeral', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Comentário geral sobre o projeto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pontos Fortes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.pontosFortes}
                    onChange={(e) => handleInputChange('pontosFortes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Destaque os pontos fortes do projeto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pontos de Melhoria
                  </label>
                  <textarea
                    rows={3}
                    value={formData.pontosMelhoria}
                    onChange={(e) => handleInputChange('pontosMelhoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Indique pontos que podem ser melhorados..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sugestões
                  </label>
                  <textarea
                    rows={3}
                    value={formData.sugestoes}
                    onChange={(e) => handleInputChange('sugestoes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sugestões para futuras pesquisas ou melhorias..."
                  />
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => saveEvaluation(false)}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja finalizar esta avaliação? Não será possível modificá-la depois.')) {
                    saveEvaluation(true);
                  }
                }}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {saving ? 'Finalizando...' : 'Finalizar Avaliação'}
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              * Campos obrigatórios. As notas de Inovação, Metodologia e Relevância são necessárias para finalizar a avaliação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;