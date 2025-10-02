// frontend/src/components/admin/AdminFeirasPanel.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
  maxProjects: number;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    projects: number;
  };
}

export const AdminFeirasPanel: React.FC = () => {
  const [tab, setTab] = useState<'pendentes' | 'ativas'>('pendentes');
  const [feiras, setFeiras] = useState<Feira[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeiras = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'pendentes' 
        ? '/feira-afiliada/solicitacoes'
        : '/feira-afiliada/ativas';
      
      const response = await api.get(endpoint);
      setFeiras(response.data);
    } catch (error) {
      console.error('Erro ao carregar feiras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeiras();
  }, [tab]);

  const handleAprovar = async (id: string) => {
    if (!confirm('Aprovar esta feira afiliada?')) return;

    try {
      await api.put(`/feira-afiliada/aprovar/${id}`);
      alert('Feira aprovada com sucesso!');
      loadFeiras();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao aprovar feira');
    }
  };

  const handleRejeitar = async (id: string) => {
    const motivo = prompt('Motivo da rejeição:');
    if (!motivo) return;

    try {
      await api.delete(`/feira-afiliada/rejeitar/${id}`, {
        data: { motivo }
      });
      alert('Solicitação rejeitada');
      loadFeiras();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao rejeitar feira');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Feiras Afiliadas</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setTab('pendentes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tab === 'pendentes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Solicitações Pendentes
          </button>
          <button
            onClick={() => setTab('ativas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tab === 'ativas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Feiras Ativas
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      )}

      {/* Lista de Feiras */}
      {!loading && feiras.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            {tab === 'pendentes' 
              ? 'Nenhuma solicitação pendente' 
              : 'Nenhuma feira ativa'}
          </p>
        </Card>
      )}

      {!loading && feiras.length > 0 && (
        <div className="grid gap-4">
          {feiras.map((feira) => (
            <Card key={feira.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{feira.name}</h3>
                    {feira.isActive && (
                      <Badge className="bg-green-500">Ativa</Badge>
                    )}
                    {!feira.isActive && (
                      <Badge className="bg-yellow-500">Pendente</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Localização:</p>
                      <p className="font-medium">{feira.city} - {feira.state}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Edição/Ano:</p>
                      <p className="font-medium">{feira.edition} ({feira.year})</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Período:</p>
                      <p className="font-medium">
                        {formatDate(feira.startDate)} a {formatDate(feira.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Limite de Projetos:</p>
                      <p className="font-medium">{feira.maxProjects} projetos</p>
                    </div>
                  </div>

                  {feira._count && (
                    <div className="mb-4 p-3 bg-blue-50 rounded">
                      <p className="text-sm">
                        <strong>{feira._count.projects}</strong> projetos credenciados
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Contato:</p>
                    <p className="text-sm text-gray-700">{feira.contactName}</p>
                    <p className="text-sm text-gray-600">{feira.contactEmail}</p>
                    {feira.contactPhone && (
                      <p className="text-sm text-gray-600">{feira.contactPhone}</p>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Solicitação enviada em: {formatDate(feira.createdAt)}
                  </p>
                </div>

                {/* Ações */}
                {!feira.isActive && (
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleAprovar(feira.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => handleRejeitar(feira.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};