// frontend/src/components/projects/FeiraCredencialSelector.tsx
import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import api from '../../services/api';

interface Feira {
  id: string;
  name: string;
  city: string;
  state: string;
  edition: string;
  year: number;
  startDate: string;
  endDate: string;
}

interface Props {
  value?: string;
  onChange: (feiraId: string | null) => void;
}

export const FeiraCredencialSelector: React.FC<Props> = ({ value, onChange }) => {
  const [feiras, setFeiras] = useState<Feira[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    loadFeiras();
  }, []);

  const loadFeiras = async () => {
    try {
      const response = await api.get('/feira-afiliada/publicas');
      setFeiras(response.data);
    } catch (error) {
      console.error('Erro ao carregar feiras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const feiraId = e.target.value || null;
    onChange(feiraId);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="feiraCredencial">
          Seu projeto foi credenciado por uma Feira Afiliada?
        </Label>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-500 hover:text-blue-700"
          title="Mais informações"
        >
          ℹ️
        </button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
          <p className="mb-2">
            <strong>O que é uma credencial de Feira Afiliada?</strong>
          </p>
          <p className="mb-2">
            Projetos credenciados por feiras afiliadas à FEBIC são <strong>aprovados automaticamente</strong> para 
            participar da Etapa Virtual, sem passar pelo Comitê de Avaliação de Submissão (CIAS).
          </p>
          <p>
            Se seu projeto foi selecionado por uma feira afiliada, selecione-a abaixo. Caso contrário, 
            deixe este campo em branco e seu projeto passará pelo processo normal de avaliação.
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Carregando feiras disponíveis...</p>
      ) : (
        <select
          id="feiraCredencial"
          value={value || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Não foi credenciado / Submissão normal</option>
          {feiras.map((feira) => (
            <option key={feira.id} value={feira.id}>
              {feira.name} - {feira.city}/{feira.state} ({feira.year})
            </option>
          ))}
        </select>
      )}

      {value && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <p className="text-green-700">
            ✓ Seu projeto será automaticamente aprovado para a Etapa Virtual por estar credenciado.
          </p>
        </div>
      )}
    </div>
  );
};