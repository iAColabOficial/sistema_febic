export interface IBGEEstado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface IBGEMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

class IBGEService {
  private readonly baseURL = 'https://servicodados.ibge.gov.br/api/v1/localidades';
  private estadosCache: Estado[] | null = null;
  private cidadesCache: Map<string, Cidade[]> = new Map();

  /**
   * Busca todos os estados brasileiros
   */
  async getEstados(): Promise<Estado[]> {
    try {
      // Usar cache se disponível
      if (this.estadosCache) {
        return this.estadosCache;
      }

      const response = await fetch(`${this.baseURL}/estados`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar estados: ${response.status}`);
      }

      const estados: IBGEEstado[] = await response.json();
      
      // Ordenar alfabeticamente e mapear para formato simplificado
      const estadosFormatados = estados
        .map(estado => ({
          id: estado.id,
          sigla: estado.sigla,
          nome: estado.nome
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      // Salvar no cache
      this.estadosCache = estadosFormatados;
      
      return estadosFormatados;
    } catch (error) {
      console.error('Erro ao buscar estados do IBGE:', error);
      throw new Error('Não foi possível carregar a lista de estados. Verifique sua conexão.');
    }
  }

  /**
   * Busca todas as cidades de um estado específico
   */
  async getCidadesByEstado(estadoId: number | string): Promise<Cidade[]> {
    try {
      const estadoIdString = estadoId.toString();
      
      // Usar cache se disponível
      if (this.cidadesCache.has(estadoIdString)) {
        return this.cidadesCache.get(estadoIdString)!;
      }

      const response = await fetch(`${this.baseURL}/estados/${estadoId}/municipios`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar cidades: ${response.status}`);
      }

      const municipios: IBGEMunicipio[] = await response.json();
      
      // Ordenar alfabeticamente e mapear para formato simplificado
      const cidadesFormatadas = municipios
        .map(municipio => ({
          id: municipio.id,
          nome: municipio.nome
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      // Salvar no cache
      this.cidadesCache.set(estadoIdString, cidadesFormatadas);
      
      return cidadesFormatadas;
    } catch (error) {
      console.error('Erro ao buscar cidades do IBGE:', error);
      throw new Error('Não foi possível carregar a lista de cidades. Verifique sua conexão.');
    }
  }

  /**
   * Busca uma cidade específica pelo nome e estado
   */
  async buscarCidade(nomeCidade: string, estadoId: number): Promise<Cidade | null> {
    try {
      const cidades = await this.getCidadesByEstado(estadoId);
      return cidades.find(cidade => 
        cidade.nome.toLowerCase() === nomeCidade.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Erro ao buscar cidade específica:', error);
      return null;
    }
  }

  /**
   * Busca um estado específico pela sigla
   */
  async buscarEstado(sigla: string): Promise<Estado | null> {
    try {
      const estados = await this.getEstados();
      return estados.find(estado => 
        estado.sigla.toLowerCase() === sigla.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Erro ao buscar estado específico:', error);
      return null;
    }
  }

  /**
   * Limpa o cache (útil para forçar atualização)
   */
  clearCache(): void {
    this.estadosCache = null;
    this.cidadesCache.clear();
  }
}

// Exportar instância singleton
export const ibgeService = new IBGEService();