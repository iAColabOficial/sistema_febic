import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react';

interface DocumentType {
  type: string;
  name: string;
  required: boolean;
  maxSize: number;
  status: 'pending' | 'uploaded';
  document: ProjectDocument | null;
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

interface DocumentUploadProps {
  projectId: string;
  onDocumentChange?: () => void;
  readOnly?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  projectId,
  onDocumentChange,
  readOnly = false
}) => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [dragOverType, setDragOverType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/documents/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setDocuments(result.data.documents);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;

    // Validar tamanho do arquivo
    const docConfig = documents.find(d => d.type === documentType);
    const maxSize = (docConfig?.maxSize || 10) * 1024 * 1024; // MB para bytes

    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Tamanho máximo: ${docConfig?.maxSize}MB`);
      return;
    }

    setUploadingType(documentType);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('description', '');

      const response = await fetch(`/api/documents/projects/${projectId}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        await loadDocuments();
        onDocumentChange?.();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro no upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar arquivo');
    } finally {
      setUploadingType(null);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro no download:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadDocuments();
        onDocumentChange?.();
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const triggerFileInput = (documentType: string) => {
    if (readOnly || uploadingType) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-document-type', documentType);
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const documentType = e.target.getAttribute('data-document-type');
    
    if (file && documentType) {
      handleFileUpload(file, documentType);
    }
    
    // Resetar input
    e.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (document: ProjectDocument | null) => {
    if (!document) return <Clock className="w-5 h-5 text-gray-400" />;
    
    if (document.isApproved === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (document.isApproved === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = (document: ProjectDocument | null) => {
    if (!document) return 'Pendente';
    if (document.isApproved === true) return 'Aprovado';
    if (document.isApproved === false) return 'Rejeitado';
    return 'Em análise';
  };

  const getStatusColor = (document: ProjectDocument | null) => {
    if (!document) return 'text-gray-500';
    if (document.isApproved === true) return 'text-green-600';
    if (document.isApproved === false) return 'text-red-600';
    return 'text-yellow-600';
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOverType(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && !readOnly) {
      handleFileUpload(files[0], documentType);
    }
  };

  const handleDragOver = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOverType(documentType);
  };

  const handleDragLeave = () => {
    setDragOverType(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const requiredDocs = documents.filter(d => d.required);
  const optionalDocs = documents.filter(d => !d.required);
  const uploadedRequired = requiredDocs.filter(d => d.status === 'uploaded').length;

  return (
    <div className="space-y-6">
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.txt,.mp4,.avi,.mov"
      />

      {/* Header com estatísticas */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Documentos do Projeto</h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">
              Obrigatórios: {uploadedRequired}/{requiredDocs.length}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              uploadedRequired === requiredDocs.length 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {uploadedRequired === requiredDocs.length ? 'Completo' : 'Incompleto'}
            </span>
          </div>
        </div>

        {uploadedRequired < requiredDocs.length && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-yellow-700">
              Alguns documentos obrigatórios ainda não foram enviados.
            </span>
          </div>
        )}
      </div>

      {/* Documentos Obrigatórios */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Documentos Obrigatórios</h4>
          <p className="text-sm text-gray-600 mt-1">
            Estes documentos são necessários para a participação na feira.
          </p>
        </div>
        <div className="divide-y">
          {requiredDocs.map((docType) => (
            <DocumentRow
              key={docType.type}
              docType={docType}
              uploadingType={uploadingType}
              dragOverType={dragOverType}
              readOnly={readOnly}
              onTriggerUpload={triggerFileInput}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              getStatusColor={getStatusColor}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      </div>

      {/* Documentos Opcionais */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Documentos Opcionais</h4>
          <p className="text-sm text-gray-600 mt-1">
            Documentos complementares que podem enriquecer seu projeto.
          </p>
        </div>
        <div className="divide-y">
          {optionalDocs.map((docType) => (
            <DocumentRow
              key={docType.type}
              docType={docType}
              uploadingType={uploadingType}
              dragOverType={dragOverType}
              readOnly={readOnly}
              onTriggerUpload={triggerFileInput}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              getStatusColor={getStatusColor}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para cada linha de documento
interface DocumentRowProps {
  docType: DocumentType;
  uploadingType: string | null;
  dragOverType: string | null;
  readOnly: boolean;
  onTriggerUpload: (type: string) => void;
  onDownload: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDrop: (e: React.DragEvent, type: string) => void;
  onDragOver: (e: React.DragEvent, type: string) => void;
  onDragLeave: () => void;
  getStatusIcon: (doc: ProjectDocument | null) => React.ReactNode;
  getStatusText: (doc: ProjectDocument | null) => string;
  getStatusColor: (doc: ProjectDocument | null) => string;
  formatFileSize: (bytes: number) => string;
}

const DocumentRow: React.FC<DocumentRowProps> = ({
  docType,
  uploadingType,
  dragOverType,
  readOnly,
  onTriggerUpload,
  onDownload,
  onDelete,
  onDrop,
  onDragOver,
  onDragLeave,
  getStatusIcon,
  getStatusText,
  getStatusColor,
  formatFileSize
}) => {
  const isUploading = uploadingType === docType.type;
  const isDragOver = dragOverType === docType.type;
  
  return (
    <div
      className={`p-4 transition-colors ${
        isDragOver ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
      onDrop={(e) => onDrop(e, docType.type)}
      onDragOver={(e) => onDragOver(e, docType.type)}
      onDragLeave={onDragLeave}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {getStatusIcon(docType.document)}
            <div>
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <span>{docType.name}</span>
                {docType.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Obrigatório
                  </span>
                )}
              </h5>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span className={getStatusColor(docType.document)}>
                  {getStatusText(docType.document)}
                </span>
                <span>Máx: {docType.maxSize}MB</span>
                {docType.document && (
                  <>
                    <span>Versão: {docType.document.version}</span>
                    <span>{formatFileSize(docType.document.fileSize)}</span>
                    {docType.document.downloadCount > 0 && (
                      <span>{docType.document.downloadCount} downloads</span>
                    )}
                  </>
                )}
              </div>
              {docType.document?.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <strong>Motivo da rejeição:</strong> {docType.document.rejectionReason}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!docType.document && !readOnly && (
            <button
              onClick={() => onTriggerUpload(docType.type)}
              disabled={isUploading}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </button>
          )}

          {docType.document && (
            <>
              <button
                onClick={() => onDownload(docType.document!.id, docType.document!.name)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>

              {!readOnly && (
                <>
                  <button
                    onClick={() => onTriggerUpload(docType.type)}
                    disabled={isUploading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Substituir
                  </button>

                  <button
                    onClick={() => onDelete(docType.document!.id)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Área de drag and drop */}
      {!docType.document && !readOnly && (
        <div
          className={`mt-3 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Arraste um arquivo aqui ou{' '}
            <button
              onClick={() => onTriggerUpload(docType.type)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              clique para selecionar
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload