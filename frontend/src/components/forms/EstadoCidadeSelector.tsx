import React from 'react';
import { MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useEstadosCidades } from '@/hooks/useEstadosCidades';

interface EstadoCidadeSelectorProps {
  // Valores controlados
  estadoSelecionado?: number | null;
  cidadeSelecionada?: number | null;
  
  // Callbacks
  onEstadoChange: (estadoId: number | null, estado: any) => void;
  onCidadeChange: (cidadeId: number | null, cidade: any) => void;
  
  // Configurações
  required?: boolean;
  disabled?: boolean;
  mostrarErros?: boolean;
  
  // Labels customizados
  labelEstado?: string;
  labelCidade?: string;
  placeholderEstado?: string;
  placeholderCidade?: string;
  
  // Classes CSS
  className?: string;
  estadoClassName?: string;
  cidadeClassName?: string;
}

export const EstadoCidadeSelector: React.FC<EstadoCidadeSelectorProps> = ({
  estadoSelecionado,
  cidadeSelecionada,
  onEstadoChange,
  onCidadeChange,
  required = false,
  disabled = false,
  mostrarErros = true,
  labelEstado = 'Estado',
  labelCidade = 'Cidade',
  placeholderEstado = 'Selecione o estado',
  placeholderCidade = 'Selecione a cidade',
  className = '',
  estadoClassName = '',
  cidadeClassName = ''
}) => {
  const {
    estados,
    estadosLoading,
    estadosError,
    cidades,
    cidadesLoading,
    cidadesError,
    selecionarEstado,
    selecionarCidade,
    recarregarDados
  } = useEstadosCidades();

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estadoId = e.target.value ? parseInt(e.target.value) : null;
    
    if (estadoId) {
      const estado = estados.find(e => e.id === estadoId);
      selecionarEstado(estadoId);
      onEstadoChange(estadoId, estado);
    } else {
      onEstadoChange(null, null);
    }
    
    // Limpar cidade quando estado muda
    onCidadeChange(null, null);
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cidadeId = e.target.value ? parseInt(e.target.value) : null;
    
    if (cidadeId) {
      const cidade = cidades.find(c => c.id === cidadeId);
      selecionarCidade(cidadeId);
      onCidadeChange(cidadeId, cidade);
    } else {
      onCidadeChange(null, null);
    }
  };

  const baseInputClass = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Estado */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            {labelEstado} {required && <span className="text-red-500">*</span>}
          </label>
          
          {estadosError && (
            <button
              type="button"
              onClick={recarregarDados}
              className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
              title="Tentar novamente"
            >
              <RefreshCw className="w-3 h-3" />
              Tentar novamente
            </button>
          )}
        </div>
        
        <div className="relative">
          <select
            value={estadoSelecionado || ''}
            onChange={handleEstadoChange}
            disabled={disabled || estadosLoading}
            className={`${baseInputClass} ${estadoClassName}`}
          >
            <option value="">
              {estadosLoading ? 'Carregando estados...' : placeholderEstado}
            </option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nome} ({estado.sigla})
              </option>
            ))}
          </select>
          
          {estadosLoading && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        
        {mostrarErros && estadosError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{estadosError}</span>
          </div>
        )}
      </div>

      {/* Cidade */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {labelCidade} {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative">
          <select
            value={cidadeSelecionada || ''}
            onChange={handleCidadeChange}
            disabled={disabled || !estadoSelecionado || cidadesLoading}
            className={`${baseInputClass} ${cidadeClassName}`}
          >
            <option value="">
              {!estadoSelecionado 
                ? 'Primeiro selecione o estado'
                : cidadesLoading 
                  ? 'Carregando cidades...'
                  : placeholderCidade
              }
            </option>
            {cidades.map((cidade) => (
              <option key={cidade.id} value={cidade.id}>
                {cidade.nome}
              </option>
            ))}
          </select>
          
          {cidadesLoading && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        
        {mostrarErros && cidadesError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{cidadesError}</span>
          </div>
        )}
      </div>
    </div>
  );
};