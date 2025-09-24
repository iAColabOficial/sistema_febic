import { useState, useEffect, useCallback } from 'react';
import { ibgeService, Estado, Cidade } from '@/services/ibgeService';

interface UseEstadosCidadesProps {
  estadoInicial?: string; // Sigla do estado
  cidadeInicial?: string; // Nome da cidade
}

interface UseEstadosCidadesReturn {
  // Estados
  estados: Estado[];
  estadosLoading: boolean;
  estadosError: string | null;
  
  // Cidades
  cidades: Cidade[];
  cidadesLoading: boolean;
  cidadesError: string | null;
  
  // Estado selecionado
  estadoSelecionado: Estado | null;
  cidadeSelecionada: Cidade | null;
  
  // Funções
  selecionarEstado: (estadoId: number) => void;
  selecionarCidade: (cidadeId: number) => void;
  resetSelecoes: () => void;
  recarregarDados: () => void;
}

export const useEstadosCidades = (props: UseEstadosCidadesProps = {}): UseEstadosCidadesReturn => {
  const { estadoInicial, cidadeInicial } = props;

  // Estados
  const [estados, setEstados] = useState<Estado[]>([]);
  const [estadosLoading, setEstadosLoading] = useState(true);
  const [estadosError, setEstadosError] = useState<string | null>(null);

  // Cidades
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadesLoading, setCidadesLoading] = useState(false);
  const [cidadesError, setCidadesError] = useState<string | null>(null);

  // Seleções
  const [estadoSelecionado, setEstadoSelecionado] = useState<Estado | null>(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);

  // Carregar estados na inicialização
  const carregarEstados = useCallback(async () => {
    try {
      setEstadosLoading(true);
      setEstadosError(null);
      
      const estadosData = await ibgeService.getEstados();
      setEstados(estadosData);

      // Se há estado inicial, selecionar automaticamente
      if (estadoInicial) {
        const estadoEncontrado = estadosData.find(estado => 
          estado.sigla.toLowerCase() === estadoInicial.toLowerCase()
        );
        if (estadoEncontrado) {
          setEstadoSelecionado(estadoEncontrado);
        }
      }
    } catch (error: any) {
      setEstadosError(error.message);
    } finally {
      setEstadosLoading(false);
    }
  }, [estadoInicial]);

  // Carregar cidades quando estado for selecionado
  const carregarCidades = useCallback(async (estadoId: number) => {
    try {
      setCidadesLoading(true);
      setCidadesError(null);
      setCidades([]);
      setCidadeSelecionada(null);
      
      const cidadesData = await ibgeService.getCidadesByEstado(estadoId);
      setCidades(cidadesData);

      // Se há cidade inicial, selecionar automaticamente
      if (cidadeInicial) {
        const cidadeEncontrada = cidadesData.find(cidade => 
          cidade.nome.toLowerCase() === cidadeInicial.toLowerCase()
        );
        if (cidadeEncontrada) {
          setCidadeSelecionada(cidadeEncontrada);
        }
      }
    } catch (error: any) {
      setCidadesError(error.message);
    } finally {
      setCidadesLoading(false);
    }
  }, [cidadeInicial]);

  // Selecionar estado
  const selecionarEstado = useCallback((estadoId: number) => {
    const estado = estados.find(e => e.id === estadoId);
    if (estado) {
      setEstadoSelecionado(estado);
      carregarCidades(estadoId);
    }
  }, [estados, carregarCidades]);

  // Selecionar cidade
  const selecionarCidade = useCallback((cidadeId: number) => {
    const cidade = cidades.find(c => c.id === cidadeId);
    if (cidade) {
      setCidadeSelecionada(cidade);
    }
  }, [cidades]);

  // Reset seleções
  const resetSelecoes = useCallback(() => {
    setEstadoSelecionado(null);
    setCidadeSelecionada(null);
    setCidades([]);
  }, []);

  // Recarregar dados (limpa cache)
  const recarregarDados = useCallback(() => {
    ibgeService.clearCache();
    carregarEstados();
  }, [carregarEstados]);

  // Effect para carregar estados inicialmente
  useEffect(() => {
    carregarEstados();
  }, [carregarEstados]);

  // Effect para carregar cidades quando estado selecionado mudar
  useEffect(() => {
    if (estadoSelecionado) {
      carregarCidades(estadoSelecionado.id);
    }
  }, [estadoSelecionado, carregarCidades]);

  return {
    // Estados
    estados,
    estadosLoading,
    estadosError,
    
    // Cidades
    cidades,
    cidadesLoading,
    cidadesError,
    
    // Seleções
    estadoSelecionado,
    cidadeSelecionada,
    
    // Funções
    selecionarEstado,
    selecionarCidade,
    resetSelecoes,
    recarregarDados
  };
};