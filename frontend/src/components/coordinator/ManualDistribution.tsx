import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  FileText, 
  Plus, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import api from '../../services/api';

interface Project {
  id: string;
  title: string;
  category: string;
  areaConhecimento: {
    nome: string;
  };
  owner: {
    name: string;
  };
  _count: {
    avaliacoes: number;
  };
  status: string;
}

interface Evaluator {
  id: string;
  name: string;
  email: string;
  formation?: string;
  _count: {
    avaliacoes: number;
  };
  area?: string;
}

interface ManualDistributionProps {
  onDistributionComplete?: () => void;
}

export const ManualDistribution: React.FC<ManualDistributionProps> = ({ 
  onDistributionComplete 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEvaluators, setSelectedEvaluators] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtros
  const [projectSearch, setProjectSearch] = useState('');
  const [evaluatorSearch, setEvaluatorSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Buscar projetos disponíveis para distribuição
  const fetchProjects = async () => {
  try {
    setLoading(true);
    const response = await api.get('/coordinator/projects/distribution');
    setProjects(response.data.projects || []);  // ✅ CORRIGIDO
  } catch (err: any) {
    setError(err.response?.data?.message || 'Erro ao carregar projetos');
  } finally {
    setLoading(false);
  }
};

const fetchEvaluators = async () => {
  try {
    setLoading(true);
    const response = await api.get('/coordinator/evaluators/available');
    setEvaluators(response.data);  // ✅ JÁ ESTÁ CORRETO
  } catch (err: any) {
    setError(err.response?.data?.message || 'Erro ao carregar avaliadores');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProjects();
    fetchEvaluators();
  }, []);

  // Filtrar projetos
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
                         project.owner.name.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtrar avaliadores
  const filteredEvaluators = evaluators.filter(evaluator =>
    evaluator.name.toLowerCase().includes(evaluatorSearch.toLowerCase()) ||
    evaluator.email.toLowerCase().includes(evaluatorSearch.toLowerCase())
  );

  // Selecionar/desselecionar avaliador
  const toggleEvaluator = (evaluatorId: string) => {
    setSelectedEvaluators(prev => {
      if (prev.includes(evaluatorId)) {
        return prev.filter(id => id !== evaluatorId);
      } else {
        return [...prev, evaluatorId];
      }
    });
  };

  // Distribuir projeto para avaliadores
  const handleDistribute = async () => {
    if (!selectedProject || selectedEvaluators.length === 0) {
      setError('Selecione um projeto e pelo menos um avaliador');
      return;
    }

    try {
      setDistributing(true);
      setError(null);
      
      await api.post('/coordinator/distribute', {
        projectId: selectedProject.id,
        evaluatorIds: selectedEvaluators
      });

      setSuccess(`Projeto distribuído para ${selectedEvaluators.length} avaliador(es) com sucesso!`);
      setSelectedProject(null);
      setSelectedEvaluators([]);
      
      // Atualizar listas
      await fetchProjects();
      await fetchEvaluators();
      
      if (onDistributionComplete) {
        onDistributionComplete();
      }

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao distribuir projeto');
    } finally {
      setDistributing(false);
    }
  };

  // Cancelar seleção
  const handleCancel = () => {
    setSelectedProject(null);
    setSelectedEvaluators([]);
    setError(null);
  };

  const categories = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'RELATO'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Distribuição Manual</h2>
        <p className="text-gray-600 mt-1">
          Atribua projetos a avaliadores específicos
        </p>
      </div>

      {/* Mensagens de Sucesso/Erro */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)}>
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Projeto Selecionado */}
      {selectedProject && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Projeto Selecionado
                </h3>
              </div>
              <p className="text-gray-900 font-medium">{selectedProject.title}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Categoria: {selectedProject.category}</span>
                <span>•</span>
                <span>Autor: {selectedProject.owner.name}</span>
                <span>•</span>
                <span>Avaliadores: {selectedProject._count.avaliacoes}/3</span>
              </div>
              {selectedEvaluators.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedEvaluators.length} avaliador(es) selecionado(s)
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDistribute}
                disabled={distributing || selectedEvaluators.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {distributing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Distribuindo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Distribuir
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={distributing}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Lista de Projetos */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Projetos Disponíveis
              </h3>
              <span className="text-sm text-gray-500">
                {filteredProjects.length} projeto(s)
              </span>
            </div>

            {/* Filtros de Projetos */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título ou autor..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>Categoria {cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de Projetos */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum projeto encontrado</p>
                </div>
              ) : (
                filteredProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedProject?.id === project.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {project.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {project.owner.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {project.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {project.areaConhecimento.nome}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <div className={`text-xs px-2 py-1 rounded ${
                          project._count.avaliacoes === 3
                            ? 'bg-green-100 text-green-700'
                            : project._count.avaliacoes > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {project._count.avaliacoes}/3
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Coluna 2: Lista de Avaliadores */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Avaliadores Disponíveis
              </h3>
              <span className="text-sm text-gray-500">
                {filteredEvaluators.length} avaliador(es)
              </span>
            </div>

            {/* Busca de Avaliadores */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={evaluatorSearch}
                onChange={(e) => setEvaluatorSearch(e.target.value)}
                className="pl-10"
                disabled={!selectedProject}
              />
            </div>

            {!selectedProject && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Selecione um projeto primeiro
                </p>
              </div>
            )}

            {/* Lista de Avaliadores */}
            {selectedProject && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : filteredEvaluators.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum avaliador encontrado</p>
                  </div>
                ) : (
                  filteredEvaluators.map(evaluator => {
                    const isSelected = selectedEvaluators.includes(evaluator.id);
                    return (
                      <button
                        key={evaluator.id}
                        onClick={() => toggleEvaluator(evaluator.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {evaluator.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {evaluator.email}
                            </p>
                            {evaluator.formation && (
                              <p className="text-xs text-gray-500 mt-1">
                                {evaluator.formation}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">
                                Projetos: {evaluator._count.avaliacoes}
                              </span>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            {isSelected ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};