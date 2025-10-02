// frontend/src/pages/feira-afiliada/SolicitarAfiliacao.tsx
import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import api from '../../services/api';
import { ibgeService } from '../../services/ibgeService';

export const SolicitarAfiliacao: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [estados, setEstados] = useState<any[]>([]);
  const [cidades, setCidades] = useState<any[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingCidades, setLoadingCidades] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    edition: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    maxProjects: 50,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Carregar estados ao montar
  useEffect(() => {
    const loadEstados = async () => {
      try {
        setLoadingEstados(true);
        const data = await ibgeService.getEstados();
        setEstados(data);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
      } finally {
        setLoadingEstados(false);
      }
    };
    
    loadEstados();
  }, []); // Array vazio - executa apenas uma vez

  const loadCidades = async (estadoId: number) => {
    try {
      setLoadingCidades(true);
      setCidades([]);
      setFormData(prev => ({ ...prev, city: '' }));
      const data = await ibgeService.getCidadesByEstado(estadoId);
      setCidades(data);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    } finally {
      setLoadingCidades(false);
    }
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sigla = e.target.value;
    setFormData(prev => ({ ...prev, state: sigla, city: '' }));
    
    const estado = estados.find(e => e.sigla === sigla);
    if (estado) {
      loadCidades(estado.id);
    } else {
      setCidades([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/feira-afiliada/solicitar', formData);
      setSuccess(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Solicitação Enviada com Sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            Sua solicitação de afiliação foi enviada para análise. Você receberá uma resposta por email em breve.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Voltar para o Início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Torne-se uma Feira Afiliada à FEBIC
          </h1>
          <p className="text-lg text-gray-600">
            Credite projetos diretamente para a etapa virtual da FEBIC
          </p>
        </div>

        {/* Benefícios */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Benefícios de ser uma Feira Afiliada:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Credenciar projetos diretamente para a FEBIC</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Projetos credenciados pulam a avaliação CIAS</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Dashboard exclusivo para gerenciar seus projetos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Fortalecer a rede de feiras científicas no Brasil</span>
            </li>
          </ul>
        </Card>

        {/* Formulário */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Dados da Feira</h3>

              <div>
                <Label htmlFor="name">Nome da Feira *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Feira de Ciências do Colégio X"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edition">Edição *</Label>
                  <Input
                    id="edition"
                    name="edition"
                    value={formData.edition}
                    onChange={handleChange}
                    required
                    placeholder="Ex: 5ª Edição"
                  />
                </div>

                <div>
                  <Label htmlFor="year">Ano *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    min={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleEstadoChange}
                    required
                    disabled={loadingEstados}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione o estado</option>
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.sigla}>
                        {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                    disabled={!formData.state || loadingCidades}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {loadingCidades ? 'Carregando...' : 'Selecione a cidade'}
                    </option>
                    {cidades.map((cidade) => (
                      <option key={cidade.id} value={cidade.nome}>
                        {cidade.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Data de Término *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxProjects">Limite de Projetos a Credenciar</Label>
                <Input
                  id="maxProjects"
                  name="maxProjects"
                  type="number"
                  value={formData.maxProjects}
                  onChange={handleChange}
                  min={1}
                  max={200}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Número máximo de projetos que você poderá credenciar (padrão: 50)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Dados de Contato</h3>

              <div>
                <Label htmlFor="contactName">Nome do Responsável *</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Telefone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> Após o envio, sua solicitação será analisada pela equipe da FEBIC.
                Você receberá um email com a resposta em até 5 dias úteis.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
              <Button
                type="button"
                onClick={() => window.history.back()}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};