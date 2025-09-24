export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

// Função simples para buscar estados
export const buscarEstados = async (): Promise<Estado[]> => {
  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    const data = await response.json();
    
    return data
      .map((estado: any) => ({
        id: estado.id,
        sigla: estado.sigla,
        nome: estado.nome
      }))
      .sort((a: Estado, b: Estado) => a.nome.localeCompare(b.nome));
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    return [];
  }
};

// Função simples para buscar cidades por estado
export const buscarCidades = async (estadoId: number): Promise<Cidade[]> => {
  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`);
    const data = await response.json();
    
    return data
      .map((municipio: any) => ({
        id: municipio.id,
        nome: municipio.nome
      }))
      .sort((a: Cidade, b: Cidade) => a.nome.localeCompare(b.nome));
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return [];
  }
};