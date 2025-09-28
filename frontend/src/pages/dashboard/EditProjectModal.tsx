import React, { useState, useEffect } from 'react';
import { X, Save, FileText, AlertTriangle, Settings, Upload, Download, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
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

interface ProjectDocument {
  id: string;
  name: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  version: number;
  isRequired: boolean;
  isApproved?: boolean | null;
  rejectionReason?: string | null;
  downloadCount: number;
  uploadedAt: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  project, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'documentos' | 'admin'>('dados');
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    objective: '',
    methodology: '',
    results: '',
    conclusion: '',
    bibliography: '',
    status: 'RASCUNHO',
    category: 'I',
    areaConhecimentoId: '',
    keywords: [] as string[],
    institution: '',
    institutionCity: '',
    institutionState: ''
  });
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<AreaConhecimento[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Carregar áreas de conhecimento
  useEffect(() => {
    if (isOpen) {
      loadAreas();
      if (project?.id) {
        loadDocuments();
      }
    }
  }, [isOpen, project?.id]);

  // Preencher formulário quando o projeto mudar
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        summary: project.summary || '',
        objective: project.objective || '',
        methodology: project.methodology || '',
        results: project.results || '',
        conclusion: project.conclusion || '',
        bibliography: project.bibliography || '',
        status: project.status || 'RASCUNHO',
        category: project.category || 'I',
        areaConhecimentoId: project.areaConhecimentoId || '',
        keywords: project.keywords || [],
        institution: project.institution || '',
        institutionCity: project.institutionCity || '',
        institutionState: project.institutionState || ''
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

  const loadDocuments = async () => {
    if (!project?.id) return;
    
    try {
      setLoadingDocs(true);
      const response = await api.get(`/documents/projects/${project.id}`);
      if (response.data.success) {
        // Extrair apenas os documentos que foram enviados
        const uploadedDocs = response.data.data.documents
          .filter((item: any) => item.document)
          .map((item: any) => item.document);
        setDocuments(uploadedDocs || []);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      const response = await api.delete(`/documents/${docId}`);
      
      if (response.data.success) {
        await loadDocuments();
        alert('Documento excluído com sucesso');
      }
    } catch (error: any) {
      console.error('Erro ao excluir documento:', error);
      alert(error.response?.data?.message || 'Erro ao excluir documento');
    }
  };

  const handleDocumentApproval = async (docId: string, approved: boolean, reason?: string) => {
    try {
      const response = await api.put(`/documents/${docId}/review`, {
        approved,
        rejectionReason: reason || null
      });
      
      if (response.data.success) {
        await loadDocuments();
        alert(response.data.message);
      }
    } catch (error: any) {
      console.error('Erro ao aprovar/reprovar documento:', error);
      alert(error.response?.data?.message || 'Erro ao processar documento');
    }
  };

  const handleDownloadDocument = async (docId: string, fileName: string) => {
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Erro ao baixar documento:', error);
      alert(error.response?.data?.message || 'Erro ao baixar documento');
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentStatusIcon = (doc: ProjectDocument) => {
    if (doc.isApproved === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (doc.isApproved === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getDocumentStatusText = (doc: ProjectDocument) => {
    if (doc.isApproved === true) return 'Aprovado';
    if (doc.isApproved === false) return 'Rejeitado';
    return 'Pendente';
  };

  const formatDocumentName = (name: string) => {
    const nameMap: { [key: string]: string } = {
      'PROJETO_COMPLETO': 'Projeto Completo',
      'RESUMO_EXECUTIVO': 'Resumo Executivo',
      'DIARIO_BORDO': 'Diário de Bordo',
      'AUTORIZACAO_IMAGEM': 'Autorização de Imagem',
      'AUTORIZACAO_RESPONSAVEL': 'Autorização de Responsável',
      'COMPROVANTE_PAGAMENTO': 'Comprovante de Pagamento',
      'DECLARACAO_ORIENTADOR': 'Declaração do Orientador',
      'DECLARACAO_INSTITUICAO': 'Declaração da Instituição',
      'CERTIFICADO_APRESENTACAO': 'Certificado de Apresentação',
      'RELATORIO_TECNICO': 'Relatório Técnico',
      'ANEXOS_TECNICOS': 'Anexos Técnicos',
      'FOTOS_PROJETO': 'Fotos do Projeto',
      'VIDEOS_PROJETO': 'Vídeos do Projeto',
      'PLANILHA_DADOS': 'Planilha de Dados',
      'OUTROS_DOCUMENTOS': 'Outros Documentos'
    };
    return nameMap[name] || name;
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'RASCUNHO', label: 'Rascunho' },
    { value: 'SUBMETIDO', label: 'Submetido' },
    { value: 'EM_ANALISE_CIAS', label: 'Em Análise CIAS' },
    { value: 'APROVADO_CIAS', label: 'Aprovado CIAS' },
    { value: 'REPROVADO_CIAS', label: 'Reprovado CIAS' },
    { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pagamento' },
    { value: 'CONFIRMADO_VIRTUAL', label: 'Confirmado Virtual' },
    { value: 'FINALISTA_PRESENCIAL', label: 'Finalista Presencial' },
    { value: 'PREMIADO', label: 'Premiado' },
    { value: 'ARQUIVADO', label: 'Arquivado' }
  ];

  const categoryOptions = [
    { value: 'I', label: 'Categoria I (Educação Infantil)' },
    { value: 'II', label: 'Categoria II (1º ao 6º ano)' },
    { value: 'III', label: 'Categoria III (7º ao 9º ano)' },
    { value: 'IV', label: 'Categoria IV (Técnico Subsequente)' },
    { value: 'V', label: 'Categoria V (EJA)' },
    { value: 'VI', label: 'Categoria VI (Ensino Médio)' },
    { value: 'VII', label: 'Categoria VII (Ensino Superior)' },
    { value: 'VIII', label: 'Categoria VIII (Pós-graduação)' },
    { value: 'IX', label: 'Categoria IX (Pesquisadores)' },
    { value: 'RELATO', label: 'Relato de Experiência' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
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

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('dados')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dados'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Dados do Projeto
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('documentos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'documentos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Documentos ({documents.length})
                </div>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'admin'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Gestão Admin
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Aba Dados do Projeto */}
          {activeTab === 'dados' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                    Resumo
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Resumo do projeto..."
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
                    value={Array.isArray(formData.keywords) ? formData.keywords.join(', ') : formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value.split(',').map(k => k.trim()))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Separe as palavras-chave por vírgula..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo
                  </label>
                  <textarea
                    value={formData.objective}
                    onChange={(e) => handleInputChange('objective', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o objetivo do projeto..."
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resultados
                  </label>
                  <textarea
                    value={formData.results}
                    onChange={(e) => handleInputChange('results', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva os resultados obtidos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conclusão
                  </label>
                  <textarea
                    value={formData.conclusion}
                    onChange={(e) => handleInputChange('conclusion', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva as conclusões..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Instituição
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Instituição *
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome da escola/universidade..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade da Instituição *
                    </label>
                    <input
                      type="text"
                      value={formData.institutionCity}
                      onChange={(e) => handleInputChange('institutionCity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cidade..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado da Instituição *
                    </label>
                    <input
                      type="text"
                      value={formData.institutionState}
                      onChange={(e) => handleInputChange('institutionState', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Estado..."
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Aba Documentos */}
          {activeTab === 'documentos' && project && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Documentos do Projeto
                </h3>
                <p className="text-sm text-gray-600">
                  Visualize, baixe e gerencie os documentos enviados pelo autor do projeto.
                </p>
              </div>

              {loadingDocs ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getDocumentStatusIcon(doc)}
                          <div>
                            <h4 className="font-medium text-gray-900">{formatDocumentName(doc.name)}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>Status: {getDocumentStatusText(doc)}</span>
                              <span>Tamanho: {formatFileSize(doc.fileSize)}</span>
                              <span>Versão: {doc.version}</span>
                              <span>Downloads: {doc.downloadCount}</span>
                              {doc.isRequired && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                            {doc.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                <strong>Motivo da rejeição:</strong> {doc.rejectionReason}
                              </div>
                            )}
                            {doc.description && (
                              <div className="mt-1 text-sm text-gray-600">
                                <strong>Descrição:</strong> {doc.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadDocument(doc.id, doc.name)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </button>

                          {doc.isApproved === null && (
                            <>
                              <button
                                onClick={() => handleDocumentApproval(doc.id, true)}
                                className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprovar
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Motivo da rejeição (opcional):');
                                  if (reason !== null) {
                                    handleDocumentApproval(doc.id, false, reason);
                                  }
                                }}
                                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeitar
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">Nenhum documento foi enviado ainda</p>
                </div>
              )}
            </div>
          )}

          {/* Aba Admin */}
          {activeTab === 'admin' && project && (
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Projeto</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Autor:</span> {project.owner?.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {project.owner?.email}
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
                    <div>
                      <span className="font-medium">Status:</span> {project.status}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Atenção ao alterar status:</p>
                    <p>Mudanças de status podem afetar a visibilidade do projeto para o autor e orientadores. Certifique-se das alterações antes de salvar.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com botões */}
        <div className="border-t p-6">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            {activeTab === 'dados' && (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditProjectModal;