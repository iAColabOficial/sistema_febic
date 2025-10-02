// frontend/src/pages/dashboard/FeiraDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';

interface DashboardData {
  feira: {
    id: string;
    name: string;
    city: string;
    state: string;
    edition: string;
    year: number;
    startDate: string;
    endDate: string;
    maxProjects: number;
    _count: {
      projects: number;
    };
  };
  totalCredenciados: number;
  vagasDisponiveis: number;
  porCategoria: Array<{
    category: string;
    _count: number;
  }>;
  porStatus: Array<{
    status: string;
    _count: number;
  }>;
}

interface Projeto {
  id: string;
  title: string;
  category: string;
  institution: string;
  institutionCity: string;
  institutionState: string;
  status: string;
  owner: {
    name: string;
    email: string;
  };
  areaConhecimento: {
    nome: string;
  };
  createdAt: string;
}

export const FeiraDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<'dashboard' | 'credenciados' | 'buscar'>('dashboard');
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetosElegiveis, setProjetosElegiveis] = useState<Projeto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [feiraId, setFeiraId] = useState<string>('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Assumindo que o managerId está no token do usuário
      // Você pode precisar ajustar isso conforme sua autenticação
      const response = await api.get('/users/me');
      const feira = response.data.managedFeiras?.[0];
      
      if (!feira) {
        alert('Você não é gestor de nenhuma feira afiliada');
        return;
      }

      setFeiraId(feira.id);
      
      const dashboardResponse = await api.get(`/feira-afiliada/${feira.id}/dashboard`);
      setDashboard(dashboardResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjetosCredenciados = async () => {
    if (!feiraId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/feira-afiliada/${feiraId}/credenciados`);
      setProjetos(response.data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjetosElegiveis = async () => {
    if (!feiraId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/feira-afiliada/${feiraId}/projetos-elegiveis`, {
        params: { search }
      });
      setProjetosElegiveis(response.data);
    } catch (error) {
      console.error('Erro ao carregar projetos elegíveis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCredenciar = async (projectId: string) => {
    if (!confirm('Credenciar este projeto para a FEBIC?')) return;

    try {
      await api.post(`/feira-afiliada/${feiraId}/credenciar/${projectId}`);
      alert('Projeto credenciado com sucesso!');
      loadDashboard();
      loadProjetosElegiveis();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao credenciar projeto');
    }
  };

  const handleRemoverCredencial = async (projectId: string) => {
    if (!confirm('Remover credencial deste projeto?')) return;

    try {
      await api.delete(`/feira-afiliada/${feiraId}/credenciar/${projectId}`);
      alert('Credencial removida');
      loadDashboard();
      loadProjetosCredenciados();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao remover credencial');
    }
  };

  useEffect(() => {
    if (tab === 'credenciados' && feiraId) {
      loadProjetosCredenciados();
    } else if (tab === 'buscar' && feiraId) {
      loadProjetosElegiveis();
    }
  }, [tab, feiraId]);

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Você não possui uma feira afiliada ativa</p>
        </Card>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    I: 'Categoria I - Educação Infantil',
    II: 'Categoria II - Fund. 1º-6º ano',
    III: 'Categoria III - Fund. 7º-9º ano',
    IV: 'Categoria IV - Ensino Técnico',
    V: 'Categoria V - EJA',
    VI: 'Categoria VI - Ensino Médio',
    VII: 'Categoria VII - Ensino Superior',
    VIII: 'Categoria VIII - Pós-Graduação',
    RELATO: 'Relato de Experiência',
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dashboard.feira.name}</h1>
        <p className="text-gray-600">
          {dashboard.feira.city} - {dashboard.feira.state} | {dashboard.feira.edition} ({dashboard.feira.year})
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab('credenciados')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tab === 'credenciados'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Projetos Credenciados ({dashboard.totalCredenciados})
          </button>
          <button
            onClick={() => setTab('buscar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tab === 'buscar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Credenciar Projetos
          </button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <p className="text-sm text-gray-500 mb-1">Projetos Credenciados</p>
              <p className="text-4xl font-bold text-blue-600">
                {dashboard.totalCredenciados}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                de {dashboard.feira.maxProjects} máximo
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-gray-500 mb-1">Vagas Disponíveis</p>
              <p className="text-4xl font-bold text-green-600">
                {dashboard.vagasDisponiveis}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round((dashboard.vagasDisponiveis / dashboard.feira.maxProjects) * 100)}% restante
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-gray-500 mb-1">Taxa de Ocupação</p>
              <p className="text-4xl font-bold text-purple-600">
                {Math.round((dashboard.totalCredenciados / dashboard.feira.maxProjects) * 100)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ 
                    width: `${(dashboard.totalCredenciados / dashboard.feira.maxProjects) * 100}%` 
                  }}
                ></div>
              </div>
            </Card>
          </div>

          {/* Distribuição por Categoria */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Projetos por Categoria</h3>
            <div className="space-y-3">
              {dashboard.porCategoria.map((cat) => (
                <div key={cat.category} className="flex justify-between items-center">
                  <span className="text-sm">{categoryLabels[cat.category]}</span>
                  <Badge>{cat._count} projetos</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribuição por Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Projetos por Status</h3>
            <div className="space-y-3">
              {dashboard.porStatus.map((status) => (
                <div key={status.status} className="flex justify-between items-center">
                  <span className="text-sm">{status.status.replace('_', ' ')}</span>
                  <Badge>{status._count} projetos</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Projetos Credenciados Tab */}
      {tab === 'credenciados' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : projetos.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Nenhum projeto credenciado ainda</p>
            </Card>
          ) : (
            projetos.map((projeto) => (
              <Card key={projeto.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{projeto.title}</h3>
                      <Badge>{categoryLabels[projeto.category]}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {projeto.institution} - {projeto.institutionCity}/{projeto.institutionState}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Área: {projeto.areaConhecimento.nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      Autor: {projeto.owner.name} ({projeto.owner.email})
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRemoverCredencial(projeto.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Remover Credencial
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Buscar Projetos Tab */}
      {tab === 'buscar' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por título ou instituição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadProjetosElegiveis()}
            />
            <Button onClick={loadProjetosElegiveis}>
              Buscar
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : projetosElegiveis.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Nenhum projeto elegível encontrado</p>
            </Card>
          ) : (
            projetosElegiveis.map((projeto) => (
              <Card key={projeto.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{projeto.title}</h3>
                      <Badge>{categoryLabels[projeto.category]}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {projeto.institution} - {projeto.institutionCity}/{projeto.institutionState}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Área: {projeto.areaConhecimento.nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      Autor: {projeto.owner.name} ({projeto.owner.email})
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCredenciar(projeto.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Credenciar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};