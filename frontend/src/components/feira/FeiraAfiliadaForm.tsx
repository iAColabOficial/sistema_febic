// frontend/src/components/feira/FeiraAfiliadaForm.tsx
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import api from '../../services/api';

export const FeiraAfiliadaForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    edition: '',
    year: new Date().getFullYear().toString(),
    startDate: '',
    endDate: '',
    maxProjects: '50',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/feira-afiliada/solicitar', formData);
      setSuccess(true);
      setFormData({
        name: '',
        city: '',
        state: '',
        edition: '',
        year: new Date().getFullYear().toString(),
        startDate: '',
        endDate: '',
        maxProjects: '50',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Solicitação Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Sua solicitação de afiliação foi enviada com sucesso. 
            Aguarde a análise da equipe FEBIC. Você receberá um email com a resposta.
          </p>
          <Button onClick={() => setSuccess(false)}>
            Enviar Nova Solicitação
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Solicitação de Feira Afiliada</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações da Feira */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Informações da Feira</h3>
          
          <div>
            <Label htmlFor="name">Nome da Feira *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Feira de Ciências de Blumenau"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Ex: SC"
                maxLength={2}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edition">Edição *</Label>
              <Input
                id="edition"
                name="edition"
                value={formData.edition}
                onChange={handleChange}
                placeholder="Ex: 1ª Edição"
                required
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
                min="2024"
                max="2030"
                required
              />
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
            <Label htmlFor="maxProjects">Máximo de Projetos a Credenciar</Label>
            <Input
              id="maxProjects"
              name="maxProjects"
              type="number"
              value={formData.maxProjects}
              onChange={handleChange}
              min="1"
              max="500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Quantos projetos sua feira pretende credenciar para a FEBIC
            </p>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Informações de Contato</h3>
          
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

          <div>
            <Label htmlFor="contactEmail">Email de Contato *</Label>
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

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>
      </form>
    </Card>
  );
};