// frontend/src/components/admin/EvaluatorApplicationsAdmin.tsx
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  User,
  Calendar,
  MessageCircle,
  Award,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface EvaluatorApplication {
  id: string;
  userId: string;
  motivation: string;
  experience: string;
  expertise?: string;
  categories: string[];
  areasOfKnowledge: string[];
  status: 'PENDENTE' | 'APROVADA' | 'REPROVADA';
  adminNotes?: string;
  evaluatedAt?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    institution?: string;
    formation?: string;
    city?: string;
    state?: string;
    role: string;
  };
}

const categoryLabels: Record<string, string> = {
  'I': 'Educação Infantil',
  'II': 'Fundamental (1º-6º)',
  'III': 'Fundamental (7º-9º)',
  'IV': 'Técnico Subsequente',
  'V': 'EJA',
  'VI': 'Ensino Médio',
  'VII': 'Superior',
  'VIII': 'Pós-graduação',
  'RELATO': 'Relato Científico-Pedagógico'
};

const AdminEvaluatorApplications: React.FC = () => {
  const [applications, setApplications] = useState<EvaluatorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<EvaluatorApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [evaluationModal, setEvaluationModal] = useState<{
    application: EvaluatorApplication | null;
    decision: 'APROVADA' | 'REPROVADA' | null;
    notes: string;
    loading: boolean;
  }>({
    application: null,
    decision: null,
    notes: '',
    loading: false
  });

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, searchTerm]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/evaluator/applications?${params.toString()}`);
      
      if (response.data.success) {
        setApplications(response.data.data.applications || []);
      }
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateApplication = async () => {
    if (!evaluationModal.application || !evaluationModal.decision) return;

    try {
      const response = await api.patch(`/evaluator/applications/${evaluationModal.application.id}/evaluate`, {
        decision: evaluationModal.decision,
        adminNotes: evaluationModal.notes.trim() || undefined
      });

      if (response.data.success) {
        await fetchApplications();
        setEvaluationModal({
          application: null,
          decision: null,
          notes: '',
          loading: false
        });
        alert(`Candidatura ${evaluationModal.decision.toLowerCase()} com sucesso!`);
      }
    } catch (error: any) {
      console.error('Erro ao avaliar candidatura:', error);
      alert(error.response?.data?.message || 'Erro ao avaliar candidatura');
    }
  };

  const openEvaluationModal = (application: EvaluatorApplication, decision: 'APROVADA' | 'REPROVADA') => {
    setEvaluationModal({
      application,
      decision,
      notes: '',
      loading: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADA': return 'bg-green-100 text-green-800';
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'REPROVADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APROVADA': return <CheckCircle className="w-4 h-4" />;
      case 'PENDENTE': return <Clock className="w-4 h-4" />;
      case 'REPROVADA': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = !searchTerm || 
      app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.motivation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pendentes: applications.filter(a => a.status === 'PENDENTE').length,
    aprovadas: applications.filter(a => a.status === 'APROVADA').length,
    reprovadas: applications.filter(a => a.status === 'REPROVADA').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Candidaturas de Avaliador
                </h1>
                <p className="text-sm text-gray-500">
                  Gerenciar solicitações para se tornar avaliador
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aprovadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aprovadas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reprovadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reprovadas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou motivação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os status</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="APROVADA">Aprovadas</option>
                  <option value="REPROVADA">Reprovadas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Candidaturas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Candidaturas ({filteredApplications.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando candidaturas...</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {application.user.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {application.user.email}
                            </span>
                            {application.user.institution && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-4 h-4" />
                                {application.user.institution}
                              </span>
                            )}
                            {application.user.city && application.user.state && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {application.user.city}, {application.user.state}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Motivação:</h5>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {application.motivation}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Categorias: </span>
                            {application.categories.slice(0, 3).map((cat) => (
                              <span key={cat} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 mr-1">
                                {categoryLabels[cat] || cat}
                              </span>
                            ))}
                            {application.categories.length > 3 && (
                              <span className="text-xs text-gray-500">+{application.categories.length - 3} mais</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Enviado em {formatDate(application.createdAt)}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>Role atual: {application.user.role}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              {application.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {application.status === 'PENDENTE' && (
                        <>
                          <button
                            onClick={() => openEvaluationModal(application, 'APROVADA')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => openEvaluationModal(application, 'REPROVADA')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Reprovar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma candidatura encontrada
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhuma candidatura encontrada com os filtros aplicados.' 
                  : 'Ainda não há candidaturas de avaliador no sistema.'
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalhes */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Candidatura de {selectedApplication.user.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedApplication.user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">Status da Candidatura</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusIcon(selectedApplication.status)}
                      {selectedApplication.status}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Enviado em {formatDate(selectedApplication.createdAt)}</p>
                  {selectedApplication.evaluatedAt && (
                    <p>Avaliado em {formatDate(selectedApplication.evaluatedAt)}</p>
                  )}
                </div>
              </div>

              {/* Dados do Candidato */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Dados do Candidato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-sm text-gray-900">{selectedApplication.user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedApplication.user.email}</p>
                  </div>
                  {selectedApplication.user.institution && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Instituição</label>
                      <p className="text-sm text-gray-900">{selectedApplication.user.institution}</p>
                    </div>
                  )}
                  {selectedApplication.user.formation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Formação</label>
                      <p className="text-sm text-gray-900">{selectedApplication.user.formation}</p>
                    </div>
                  )}
                  {selectedApplication.user.city && selectedApplication.user.state && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Localização</label>
                      <p className="text-sm text-gray-900">{selectedApplication.user.city}, {selectedApplication.user.state}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role Atual</label>
                    <p className="text-sm text-gray-900">{selectedApplication.user.role}</p>
                  </div>
                </div>
              </div>

              {/* Motivação */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Motivação</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedApplication.motivation}
                  </p>
                </div>
              </div>

              {/* Experiência */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Experiência</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedApplication.experience}
                  </p>
                </div>
              </div>

              {/* Expertise */}
              {selectedApplication.expertise && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Áreas de Expertise</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.expertise}
                    </p>
                  </div>
                </div>
              )}

              {/* Categorias */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Categorias que deseja avaliar ({selectedApplication.categories.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {categoryLabels[category] || category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Áreas de Conhecimento */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Áreas de Conhecimento ({selectedApplication.areasOfKnowledge.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.areasOfKnowledge.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Anotações do Admin */}
              {selectedApplication.adminNotes && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Anotações Administrativas</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                      {selectedApplication.adminNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Ações */}
              {selectedApplication.status === 'PENDENTE' && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openEvaluationModal(selectedApplication, 'REPROVADA');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reprovar
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openEvaluationModal(selectedApplication, 'APROVADA');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Aprovar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avaliação */}
      {evaluationModal.application && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {evaluationModal.decision === 'APROVADA' ? 'Aprovar' : 'Reprovar'} Candidatura
              </h3>
              <button
                onClick={() => setEvaluationModal({ application: null, decision: null, notes: '', loading: false })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Você está prestes a {evaluationModal.decision === 'APROVADA' ? 'aprovar' : 'reprovar'} a candidatura de:
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {evaluationModal.application.user.name}
                </p>
                <p className="text-sm text-gray-500">
                  {evaluationModal.application.user.email}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anotações (opcional)
                </label>
                <textarea
                  value={evaluationModal.notes}
                  onChange={(e) => setEvaluationModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={`Adicione uma observação sobre a ${evaluationModal.decision === 'APROVADA' ? 'aprovação' : 'reprovação'}...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <p>
                      {evaluationModal.decision === 'APROVADA' 
                        ? 'Ao aprovar, o usuário receberá o role AVALIADOR e poderá acessar o sistema de avaliações.'
                        : 'Ao reprovar, o usuário será notificado e poderá fazer uma nova candidatura no futuro.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEvaluationModal({ application: null, decision: null, notes: '', loading: false })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={evaluationModal.loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEvaluateApplication}
                  disabled={evaluationModal.loading}
                  className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                    evaluationModal.decision === 'APROVADA'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {evaluationModal.loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    evaluationModal.decision === 'APROVADA' ? 'Confirmar Aprovação' : 'Confirmar Reprovação'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvaluatorApplications;