import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  GraduationCap, 
  Search, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Save,
  FileText,
  Users,
  MapPin,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CreateProjectData, ProjectMember, ProjectOrientador, ProjectCategory } from '../../types/Project';
import ValidatedField, { validationRules } from '../../components/projects/ValidatedField';
import { buscarEstados, buscarCidades, Estado, Cidade } from '../../utils/ibge';

interface AreaConhecimento {
  id: string;
  sigla: string;
  nome: string;
  nivel: number;
}

const CATEGORY_MEMBER_LIMITS: Record<ProjectCategory, number> = {
  I: 6,
  II: 5,
  III: 3,
  IV: 3,
  V: 3,
  VI: 3,
  VII: 3,
  VIII: 3,
  IX: 3,
  RELATO: 3
};

const CATEGORIES = [
  { value: 'I', label: 'Categoria I - Educação Infantil (Pré I e Pré II)' },
  { value: 'II', label: 'Categoria II - Ensino Fundamental (1º ao 3º ano)' },
  { value: 'III', label: 'Categoria III - Ensino Fundamental (4º ao 6º ano)' },
  { value: 'IV', label: 'Categoria IV - Ensino Fundamental (7º ao 9º ano)' },
  { value: 'V', label: 'Categoria V - Ensino Médio' },
  { value: 'VI', label: 'Categoria VI - Ensino Técnico' },
  { value: 'VII', label: 'Categoria VII - EJA - Educação de Jovens e Adultos' },
  { value: 'VIII', label: 'Categoria VIII - Ensino Superior' },
  { value: 'IX', label: 'Categoria IX - Pós-graduação' },
  { value: 'RELATO', label: 'Relato de Experiência Científico-Pedagógica' }
];

const SCHOOL_LEVELS = [
  { value: 'Educação Infantil', label: 'Educação Infantil' },
  { value: 'Ensino Fundamental 1º-3º', label: 'Ensino Fundamental 1º-3º' },
  { value: 'Ensino Fundamental 4º-6º', label: 'Ensino Fundamental 4º-6º' },
  { value: 'Ensino Fundamental 7º-9º', label: 'Ensino Fundamental 7º-9º' },
  { value: 'Ensino Médio', label: 'Ensino Médio' },
  { value: 'Ensino Técnico', label: 'Ensino Técnico' },
  { value: 'EJA - Educação de Jovens e Adultos', label: 'EJA - Educação de Jovens e Adultos' },
  { value: 'Ensino Superior', label: 'Ensino Superior' },
  { value: 'Pós-graduação', label: 'Pós-graduação' }
];

const GENDERS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
  { value: 'Prefiro não informar', label: 'Prefiro não informar' }
];

interface CreateProjectProps {
  onSubmit: (data: CreateProjectData) => Promise<void>;
  onCancel: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchingCPF, setSearchingCPF] = useState(false);
  
  // Buscar dados do usuário autenticado
  const { user } = useAuth();

  // Estados para IBGE
  const [estadosIBGE, setEstadosIBGE] = useState<Estado[]>([]);
  const [cidadesIBGE, setCidadesIBGE] = useState<Cidade[]>([]);
  const [carregandoEstadosIBGE, setCarregandoEstadosIBGE] = useState(true);
  const [carregandoCidadesIBGE, setCarregandoCidadesIBGE] = useState(false);

  // Estados para áreas hierárquicas
  const [areasNivel1, setAreasNivel1] = useState<AreaConhecimento[]>([]);
  const [areasNivel2, setAreasNivel2] = useState<AreaConhecimento[]>([]);
  const [areasNivel3, setAreasNivel3] = useState<AreaConhecimento[]>([]);
  const [selectedAreaNivel1, setSelectedAreaNivel1] = useState('');
  const [selectedAreaNivel2, setSelectedAreaNivel2] = useState('');

  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    summary: '',
    objective: '',
    methodology: '',
    results: '',
    conclusion: '',
    bibliography: '',
    category: '',
    areaConhecimentoId: '',
    keywords: [],
    researchLine: '',
    institution: '',
    institutionCity: '',
    institutionState: '',
    institutionCountry: 'Brasil',
    isPublicSchool: false,
    isRuralSchool: false,
    isIndigenous: false,
    hasDisability: false,
    socialVulnerability: false,
    members: [], // Será pré-populado com o usuário logado
    orientadores: [],
    paymentRequired: true,
    isPaymentExempt: false,
    exemptionReason: ''
  });

  // Pré-popular com o usuário logado baseado no role
// Pré-popular com o usuário logado baseado no role
useEffect(() => {
  if (user && user.role === 'AUTOR' && formData.members.length === 0) {
    const userAsMember: ProjectMember = {
      userId: user.id,
      name: user.name || '',
      email: user.email || '',
      cpf: user.cpf || '',
      rg: '',
      birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
      gender: user.gender || 'Prefiro não informar',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      schoolLevel: getSchoolLevelFromFormation(user.formation) || 'Ensino Superior',
      schoolYear: '',
      institution: user.institution || '',
      isIndigenous: false,
      hasDisability: false,
      isRural: false
    };

    setFormData(prev => ({
      ...prev,
      members: [userAsMember],
      institution: user.institution || prev.institution,
      institutionCity: user.city || prev.institutionCity,
      institutionState: user.state || prev.institutionState
    }));
  } else if (user && user.role === 'ORIENTADOR') {
    // Para orientadores, apenas pré-popular dados institucionais
    setFormData(prev => ({
      ...prev,
      institution: user.institution || prev.institution,
      institutionCity: user.city || prev.institutionCity,
      institutionState: user.state || prev.institutionState
    }));
  }
}, [user, formData.members.length]);

// Pré-popular orientador se o usuário for ORIENTADOR
useEffect(() => {
  if (user && user.role === 'ORIENTADOR' && formData.orientadores.length === 0) {
    const userAsOrientador: ProjectOrientador = {
      userId: user.id,
      name: user.name || '',
      email: user.email || '',
      cpf: user.cpf || '',
      phone: user.phone || '',
      formation: user.formation || 'Não informado',
      area: user.formation || 'Área não especificada',
      institution: user.institution || '',
      position: user.position || 'Orientador',
      city: user.city || '',
      state: user.state || '',
      yearsExperience: 0,
      lattesUrl: ''
    };

    setFormData(prev => ({
      ...prev,
      orientadores: [userAsOrientador]
    }));
  }
}, [user, formData.orientadores.length]);

  // Helper function para determinar nível escolar
  const getSchoolLevelFromFormation = (formation?: string): string => {
    if (!formation) return 'Ensino Superior';
    
    const formationLower = formation.toLowerCase();
    
    if (formationLower.includes('doutorado') || formationLower.includes('phd')) {
      return 'Pós-graduação';
    }
    
    if (formationLower.includes('mestrado') || formationLower.includes('master')) {
      return 'Pós-graduação';
    }
    
    if (formationLower.includes('especialização') || formationLower.includes('pós-graduação')) {
      return 'Pós-graduação';
    }
    
    if (formationLower.includes('superior') || formationLower.includes('graduação') || formationLower.includes('bacharel')) {
      return 'Ensino Superior';
    }
    
    if (formationLower.includes('técnico')) {
      return 'Ensino Técnico';
    }
    
    if (formationLower.includes('médio')) {
      return 'Ensino Médio';
    }
    
    return 'Ensino Superior';
  };

  // Carregar estados quando componente monta
  useEffect(() => {
    const carregarEstados = async () => {
      setCarregandoEstadosIBGE(true);
      const estadosData = await buscarEstados();
      setEstadosIBGE(estadosData);
      setCarregandoEstadosIBGE(false);
    };
    
    carregarEstados();
  }, []);

  // Handler para mudança de estado da instituição
  const handleEstadoInstituicaoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estadoId = e.target.value;
    
    setFormData(prev => ({ 
      ...prev, 
      institutionState: estadoId,
      institutionCity: ''
    }));
    
    if (estadoId) {
      setCarregandoCidadesIBGE(true);
      const cidadesData = await buscarCidades(parseInt(estadoId));
      setCidadesIBGE(cidadesData);
      setCarregandoCidadesIBGE(false);
    } else {
      setCidadesIBGE([]);
    }
  };

  // Carregar áreas principais
  useEffect(() => {
    const fetchAreasNivel1 = async () => {
      try {
        const response = await api.get('/projects/areas/principais');
        if (response.data.success) {
          setAreasNivel1(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar áreas principais:', error);
      }
    };
    fetchAreasNivel1();
  }, []);

  // Carregar subáreas nível 2
  useEffect(() => {
    const fetchAreasNivel2 = async () => {
      if (selectedAreaNivel1) {
        try {
          const response = await api.get(`/projects/areas/subareas/${selectedAreaNivel1}`);
          if (response.data.success) {
            setAreasNivel2(response.data.data);
            setAreasNivel3([]);
            setSelectedAreaNivel2('');
            setFormData(prev => ({ ...prev, areaConhecimentoId: '' }));
          }
        } catch (error) {
          console.error('Erro ao carregar subáreas nível 2:', error);
        }
      } else {
        setAreasNivel2([]);
        setAreasNivel3([]);
      }
    };
    fetchAreasNivel2();
  }, [selectedAreaNivel1]);

  // Carregar subáreas nível 3
  useEffect(() => {
    const fetchAreasNivel3 = async () => {
      if (selectedAreaNivel2) {
        try {
          const response = await api.get(`/projects/areas/subareas/${selectedAreaNivel2}`);
          if (response.data.success) {
            setAreasNivel3(response.data.data);
            if (response.data.data.length === 0) {
              setFormData(prev => ({ ...prev, areaConhecimentoId: selectedAreaNivel2 }));
            } else {
              setFormData(prev => ({ ...prev, areaConhecimentoId: '' }));
            }
          }
        } catch (error) {
          console.error('Erro ao carregar subáreas nível 3:', error);
        }
      } else {
        setAreasNivel3([]);
      }
    };
    fetchAreasNivel3();
  }, [selectedAreaNivel2]);

  const searchUserByCPF = async (cpf: string): Promise<any> => {
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      throw new Error('CPF deve ter 11 dígitos');
    }

    setSearchingCPF(true);
    try {
      const response = await api.get(`/auth/search-cpf/${cpf}`);
      return response.data.success ? response.data.data : null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error('Erro ao buscar usuário');
    } finally {
      setSearchingCPF(false);
    }
  };

  const addMember = () => {
    if (!formData.category) {
      console.log("ERROR:", 'Selecione uma categoria primeiro');
      return;
    }

    const maxMembers = CATEGORY_MEMBER_LIMITS[formData.category as ProjectCategory];
    if (formData.members.length >= maxMembers) {
      console.log("ERROR:", `Categoria ${formData.category} permite no máximo ${maxMembers} integrantes`);
      return;
    }

    const newMember: ProjectMember = {
      name: '',
      email: '',
      cpf: '',
      rg: '',
      birthDate: '',
      gender: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      schoolLevel: '',
      schoolYear: '',
      institution: '',
      isIndigenous: false,
      hasDisability: false,
      isRural: false
    };

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const removeMember = (index: number) => {
    // Não permitir remover o primeiro membro se for AUTOR
    if (user?.role === 'AUTOR' && index === 0) {
      console.log("ERROR:", 'Você não pode se remover como autor do projeto');
      return;
    }

    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const updateMember = (index: number, field: keyof ProjectMember, value: any) => {
    // Não permitir editar campos críticos do primeiro membro se for AUTOR
    if (user?.role === 'AUTOR' && index === 0 && ['name', 'email', 'cpf'].includes(field)) {
      console.log("ERROR:", 'Não é possível alterar dados básicos do autor principal');
      return;
    }

    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFormData(prev => ({ ...prev, members: updatedMembers }));
  };

  const searchMemberByCPF = async (index: number, cpf: string) => {
    // Não permitir busca por CPF para o primeiro membro se for AUTOR
    if (user?.role === 'AUTOR' && index === 0) {
      console.log("ERROR:", 'Você já está cadastrado como autor principal');
      return;
    }

    try {
      const userData = await searchUserByCPF(cpf);
      
      if (userData) {
        // Verificar se não é o usuário logado (para qualquer role)
        if (userData.id === user?.id) {
          console.log("ERROR:", user?.role === 'AUTOR' ? 'Você já está cadastrado como autor principal' : 'Você não pode se adicionar como integrante');
          return;
        }

        const updatedMembers = [...formData.members];
        updatedMembers[index] = {
          ...updatedMembers[index],
          userId: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          cpf: userData.cpf || cpf,
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          institution: userData.institution || '',
          birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : '',
          gender: userData.gender || ''
        };

        setFormData(prev => ({ ...prev, members: updatedMembers }));
        console.log("SUCCESS:", 'Dados preenchidos automaticamente');
      } else {
        alert('CPF não encontrado. Preencha os dados manualmente.');
      }
    } catch (error: any) {
      console.log("ERROR:", error.message);
    }
  };

  const addOrientador = () => {
    if (formData.orientadores.length >= 2) {
      console.log("ERROR:", 'Máximo de 2 orientadores permitido (1 orientador + 1 coorientador)');
      return;
    }

    const newOrientador: ProjectOrientador = {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      formation: '',
      area: '',
      institution: '',
      position: '',
      city: '',
      state: '',
      yearsExperience: 0,
      lattesUrl: ''
    };

    setFormData(prev => ({
      ...prev,
      orientadores: [...prev.orientadores, newOrientador]
    }));
  };

  const removeOrientador = (index: number) => {
    setFormData(prev => ({
      ...prev,
      orientadores: prev.orientadores.filter((_, i) => i !== index)
    }));
  };

  const updateOrientador = (index: number, field: keyof ProjectOrientador, value: any) => {
    // Validação para não permitir que membros sejam orientadores
    if (field === 'email' || field === 'cpf') {
      const isUserMember = formData.members.some(member => 
        member.email === value || member.cpf === value
      );
      
      if (isUserMember) {
        console.log("ERROR:", 'Integrantes do projeto não podem ser orientadores');
        return;
      }
    }

    const updatedOrientadores = [...formData.orientadores];
    updatedOrientadores[index] = { ...updatedOrientadores[index], [field]: value };
    setFormData(prev => ({ ...prev, orientadores: updatedOrientadores }));
  };

  const searchOrientadorByCPF = async (index: number, cpf: string) => {
    try {
      const userData = await searchUserByCPF(cpf);
      
      if (userData) {
        // Validar se não é membro do projeto
        const isProjectMember = formData.members.some(member => 
          member.email === userData.email || member.cpf === userData.cpf
        );

        if (isProjectMember) {
          console.log("ERROR:", 'Integrantes do projeto não podem ser orientadores');
          return;
        }

        const updatedOrientadores = [...formData.orientadores];
        updatedOrientadores[index] = {
          ...updatedOrientadores[index],
          userId: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          cpf: userData.cpf || cpf,
          phone: userData.phone || '',
          formation: userData.formation || '',
          institution: userData.institution || '',
          city: userData.city || '',
          state: userData.state || '',
          position: userData.position || ''
        };

        setFormData(prev => ({ ...prev, orientadores: updatedOrientadores }));
        console.log("SUCCESS:", 'Dados preenchidos automaticamente');
      } else {
        alert('CPF não encontrado. Preencha os dados manualmente.');
      }
    } catch (error: any) {
      console.log("ERROR:", error.message);
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim() || formData.title.length < 10) return false;
        if (!formData.summary.trim() || formData.summary.length < 50) return false;
        if (!formData.objective.trim() || formData.objective.length < 20) return false;
        if (!formData.methodology.trim() || formData.methodology.length < 50) return false;
        if (!formData.category) return false;
        if (!formData.areaConhecimentoId) return false;
        if (!formData.institution.trim() || formData.institution.length < 3) return false;
        return true;

      case 2:
        // Para AUTOR: deve ter pelo menos ele mesmo como membro
        if (user?.role === 'AUTOR') {
          if (formData.members.length === 0) return false;
          return formData.members.every(member => 
            member.name.trim().length >= 2 &&
            member.birthDate &&
            member.gender &&
            member.city.trim().length >= 2 &&
            member.state.trim().length >= 2 &&
            member.schoolLevel &&
            member.institution.trim().length >= 2
          );
        }
        // Para ORIENTADOR: pode não ter membros (serão adicionados)
        if (user?.role === 'ORIENTADOR') {
          // Se tem membros, validar que estão preenchidos corretamente
          if (formData.members.length > 0) {
            return formData.members.every(member => 
              member.name.trim().length >= 2 &&
              member.birthDate &&
              member.gender &&
              member.city.trim().length >= 2 &&
              member.state.trim().length >= 2 &&
              member.schoolLevel &&
              member.institution.trim().length >= 2
            );
          }
          return true; // Orientador pode prosseguir sem membros
        }
        return true;

      case 3:
  // Se o usuário é ORIENTADOR, pular esta validação (já tem orientador automático)
  if (user?.role === 'ORIENTADOR') {
    return true;
  }
  
  // Para outros roles, validar orientadores normalmente
  if (formData.orientadores.length === 0) return false;
  return formData.orientadores.every(orientador =>
    orientador.name.trim().length >= 2 &&
    orientador.email.trim() &&
    orientador.formation.trim().length >= 5 &&
    orientador.area.trim().length >= 3 &&
    orientador.institution.trim().length >= 2
  );

default:
  return true;
    }
  };

  const nextStep = () => {
  if (validateStep(currentStep)) {
    // Se está no step 2 e o usuário é ORIENTADOR, pular direto para submit
    if (currentStep === 2 && user?.role === 'ORIENTADOR') {
      handleSubmit(); // Finalizar direto
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  } else {
    console.log("ERROR:", 'Por favor, preencha todos os campos obrigatórios corretamente');
  }
};

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      console.log("ERROR:", 'Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      console.log("SUCCESS:", 'Projeto criado com sucesso!');
    } catch (error: any) {
      console.log("ERROR:", error.message || 'Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar etapa 1 - Dados do Projeto
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Dados do Projeto</h3>
      </div>

      <ValidatedField
        label="Título do Projeto"
        required
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        validationRules={validationRules.title}
        maxLength={500}
        placeholder="Digite o título do projeto"
      />

      <ValidatedField
        label="Resumo"
        required
        type="textarea"
        value={formData.summary}
        onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
        validationRules={validationRules.summary}
        maxLength={3000}
        rows={4}
        placeholder="Resumo do projeto"
      />

      <ValidatedField
        label="Objetivo"
        required
        type="textarea"
        value={formData.objective}
        onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
        validationRules={validationRules.objective}
        maxLength={2000}
        rows={3}
        placeholder="Objetivos do projeto"
      />

      <ValidatedField
        label="Metodologia"
        required
        type="textarea"
        value={formData.methodology}
        onChange={(e) => setFormData(prev => ({ ...prev, methodology: e.target.value }))}
        validationRules={validationRules.methodology}
        maxLength={3000}
        rows={4}
        placeholder="Metodologia utilizada"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedField
          label="Categoria"
          required
          type="select"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProjectCategory }))}
          placeholder="Selecione uma categoria"
          options={CATEGORIES}
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Área de Conhecimento *</label>
          
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Grande Área</label>
            <select
              value={selectedAreaNivel1}
              onChange={(e) => setSelectedAreaNivel1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma grande área</option>
              {areasNivel1.map(area => (
                <option key={area.id} value={area.id}>
                  {area.sigla} - {area.nome}
                </option>
              ))}
            </select>
          </div>

          {areasNivel2.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Área</label>
              <select
                value={selectedAreaNivel2}
                onChange={(e) => setSelectedAreaNivel2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma área</option>
                {areasNivel2.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.sigla} - {area.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {areasNivel3.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Subárea</label>
              <select
                value={formData.areaConhecimentoId}
                onChange={(e) => setFormData(prev => ({ ...prev, areaConhecimentoId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma subárea</option>
                {areasNivel3.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.sigla} - {area.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {formData.category && (
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Categoria {formData.category}: Máximo de {CATEGORY_MEMBER_LIMITS[formData.category as ProjectCategory]} integrantes
          </p>
        </div>
      )}

      {/* Instituição com IBGE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ValidatedField
          label="Instituição"
          required
          value={formData.institution}
          onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
          validationRules={validationRules.institution}
          maxLength={200}
          placeholder="Nome da instituição"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            value={formData.institutionState}
            onChange={handleEstadoInstituicaoChange}
            disabled={carregandoEstadosIBGE}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">
              {carregandoEstadosIBGE ? "Carregando..." : "Selecione o estado"}
            </option>
            {estadosIBGE.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Cidade</label>
          <select
            value={formData.institutionCity}
            onChange={(e) => setFormData(prev => ({ ...prev, institutionCity: e.target.value }))}
            disabled={!formData.institutionState || carregandoCidadesIBGE}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">
              {!formData.institutionState 
                ? "Primeiro selecione o estado"
                : carregandoCidadesIBGE 
                  ? "Carregando..."
                  : "Selecione a cidade"
              }
            </option>
            {cidadesIBGE.map((cidade) => (
              <option key={cidade.id} value={cidade.nome}>
                {cidade.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Características da escola/projeto */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Características do Projeto</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isPublicSchool}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublicSchool: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Escola Pública</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isRuralSchool}
              onChange={(e) => setFormData(prev => ({ ...prev, isRuralSchool: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Escola Rural</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.socialVulnerability}
              onChange={(e) => setFormData(prev => ({ ...prev, socialVulnerability: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Vulnerabilidade Social</span>
          </label>
        </div>
      </div>

      {/* Palavras-chave */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Palavras-chave</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addKeyword(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite uma palavra-chave e pressione Enter"
        />
      </div>
    </div>
  );

  // Renderizar etapa 2 - Integrantes (pré-populado com usuário logado)
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Integrantes do Projeto</h3>
        </div>
        <button
          type="button"
          onClick={addMember}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Adicionar Integrante
        </button>
      </div>

      {/* Aviso baseado no role do usuário */}
      {user?.role === 'AUTOR' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Autor Principal</h4>
              <p className="text-sm text-green-700 mt-1">
                Você ({user?.name}) é o autor principal e não pode ser removido do projeto.
                Pode adicionar outros integrantes se necessário.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Orientador</h4>
              <p className="text-sm text-blue-700 mt-1">
                Como orientador, você deve adicionar os alunos/autores do projeto. 
                Você será automaticamente adicionado como orientador na próxima etapa.
              </p>
            </div>
          </div>
        </div>
      )}

      {formData.category && (
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Categoria {formData.category}: Máximo de {CATEGORY_MEMBER_LIMITS[formData.category as ProjectCategory]} integrantes permitido
          </p>
        </div>
      )}

      <div className="space-y-6">
        {formData.members.map((member, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">
                {user?.role === 'AUTOR' && index === 0 ? (
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    Autor Principal (Você)
                  </span>
                ) : (
                  `Integrante ${index + 1}`
                )}
              </h4>
              {!(user?.role === 'AUTOR' && index === 0) && (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Busca por CPF para integrantes adicionais (não para autor principal se for AUTOR) */}
            {!(user?.role === 'AUTOR' && index === 0) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por CPF (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={member.cpf || ''}
                    onChange={(e) => updateMember(index, 'cpf', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                  />
                  <button
                    type="button"
                    onClick={() => member.cpf && searchMemberByCPF(index, member.cpf)}
                    disabled={!member.cpf || searchingCPF}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Dados pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedField
                label="Nome Completo"
                required
                value={member.name}
                onChange={(e) => updateMember(index, 'name', e.target.value)}
                validationRules={validationRules.memberName}
                maxLength={200}
                disabled={user?.role === 'AUTOR' && index === 0} // Desabilitar para autor principal
              />

              <ValidatedField
                label="Email"
                type="email"
                value={member.email || ''}
                onChange={(e) => updateMember(index, 'email', e.target.value)}
                validationRules={validationRules.email}
                disabled={user?.role === 'AUTOR' && index === 0} // Desabilitar para autor principal
              />

              <ValidatedField
                label="Data de Nascimento"
                required
                type="date"
                value={member.birthDate}
                onChange={(e) => updateMember(index, 'birthDate', e.target.value)}
              />

              <ValidatedField
                label="Gênero"
                required
                type="select"
                value={member.gender}
                onChange={(e) => updateMember(index, 'gender', e.target.value)}
                options={GENDERS}
                placeholder="Selecione o gênero"
              />

              <ValidatedField
                label="Telefone"
                type="tel"
                value={member.phone || ''}
                onChange={(e) => updateMember(index, 'phone', e.target.value)}
              />

              <ValidatedField
                label="RG"
                value={member.rg || ''}
                onChange={(e) => updateMember(index, 'rg', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <ValidatedField
                label="Cidade"
                required
                value={member.city}
                onChange={(e) => updateMember(index, 'city', e.target.value)}
                validationRules={validationRules.city}
                maxLength={100}
              />

              <ValidatedField
                label="Estado"
                required
                value={member.state}
                onChange={(e) => updateMember(index, 'state', e.target.value.toUpperCase())}
                validationRules={validationRules.state}
                maxLength={2}
                placeholder="UF"
              />

              <ValidatedField
                label="CEP"
                value={member.zipCode || ''}
                onChange={(e) => updateMember(index, 'zipCode', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <ValidatedField
                label="Nível Escolar"
                required
                type="select"
                value={member.schoolLevel}
                onChange={(e) => updateMember(index, 'schoolLevel', e.target.value)}
                options={SCHOOL_LEVELS}
                placeholder="Selecione o nível escolar"
              />

              <ValidatedField
                label="Série/Ano"
                value={member.schoolYear || ''}
                onChange={(e) => updateMember(index, 'schoolYear', e.target.value)}
              />
            </div>

            <ValidatedField
              label="Instituição"
              required
              value={member.institution}
              onChange={(e) => updateMember(index, 'institution', e.target.value)}
              validationRules={validationRules.institution}
              maxLength={200}
            />

            <div className="mt-4">
              <h5 className="font-medium text-gray-900 mb-2">Características Especiais</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={member.isIndigenous}
                    onChange={(e) => updateMember(index, 'isIndigenous', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Indígena</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={member.hasDisability}
                    onChange={(e) => updateMember(index, 'hasDisability', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Pessoa com Deficiência</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={member.isRural}
                    onChange={(e) => updateMember(index, 'isRural', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Zona Rural</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar etapa 3 - Orientadores
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Orientadores</h3>
        </div>
        <button
          type="button"
          onClick={addOrientador}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Adicionar Orientador
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Importante</h4>
            <p className="text-sm text-yellow-700 mt-1">
              É obrigatório pelo menos 1 orientador. Máximo de 2 orientadores (orientador + coorientador).
              <br />
              <strong>Orientadores não podem ser integrantes do projeto.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {formData.orientadores.map((orientador, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">
                {user?.role === 'ORIENTADOR' && index === 0 ? (
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    Orientador Principal (Você)
                  </span>
                ) : index === 0 ? (
                  'Orientador'
                ) : (
                  'Coorientador'
                )}
              </h4>
              {!(user?.role === 'ORIENTADOR' && index === 0) && (
                <button
                  type="button"
                  onClick={() => removeOrientador(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por CPF (opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={orientador.cpf || ''}
                  onChange={(e) => updateOrientador(index, 'cpf', e.target.value)}
                  disabled={user?.role === 'ORIENTADOR' && index === 0}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="000.000.000-00"
                />
                <button
                  type="button"
                  onClick={() => orientador.cpf && searchOrientadorByCPF(index, orientador.cpf)}
                  disabled={!orientador.cpf || searchingCPF || (user?.role === 'ORIENTADOR' && index === 0)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedField
                label="Nome Completo"
                required
                value={orientador.name}
                onChange={(e) => updateOrientador(index, 'name', e.target.value)}
                validationRules={validationRules.memberName}
                maxLength={200}
                disabled={user?.role === 'ORIENTADOR' && index === 0}
              />

              <ValidatedField
                label="Email"
                required
                type="email"
                value={orientador.email}
                onChange={(e) => updateOrientador(index, 'email', e.target.value)}
                validationRules={validationRules.email}
                disabled={user?.role === 'ORIENTADOR' && index === 0}
              />

              <ValidatedField
                label="Telefone"
                type="tel"
                value={orientador.phone || ''}
                onChange={(e) => updateOrientador(index, 'phone', e.target.value)}
              />

              <ValidatedField
                label="Formação"
                required
                value={orientador.formation}
                onChange={(e) => updateOrientador(index, 'formation', e.target.value)}
                validationRules={validationRules.orientadorFormation}
                maxLength={200}
                placeholder="Ex: Doutorado em Biologia"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <ValidatedField
                label="Área de Atuação"
                required
                value={orientador.area}
                onChange={(e) => updateOrientador(index, 'area', e.target.value)}
                validationRules={validationRules.orientadorArea}
                maxLength={200}
              />

              <ValidatedField
                label="Cargo/Posição"
                value={orientador.position || ''}
                onChange={(e) => updateOrientador(index, 'position', e.target.value)}
                placeholder="Ex: Professor, Pesquisador"
              />
            </div>

            <ValidatedField
              label="Instituição"
              required
              value={orientador.institution}
              onChange={(e) => updateOrientador(index, 'institution', e.target.value)}
              validationRules={validationRules.institution}
              maxLength={200}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <ValidatedField
                label="Cidade"
                value={orientador.city}
                onChange={(e) => updateOrientador(index, 'city', e.target.value)}
                validationRules={validationRules.city}
                maxLength={100}
              />

              <ValidatedField
                label="Estado"
                value={orientador.state}
                onChange={(e) => updateOrientador(index, 'state', e.target.value.toUpperCase())}
                validationRules={validationRules.state}
                maxLength={2}
                placeholder="UF"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Anos de Experiência</label>
                <input
                  type="number"
                  value={orientador.yearsExperience || ''}
                  onChange={(e) => updateOrientador(index, 'yearsExperience', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-gray-700">Link do Currículo Lattes</label>
              <input
                type="url"
                value={orientador.lattesUrl || ''}
                onChange={(e) => updateOrientador(index, 'lattesUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://lattes.cnpq.br/..."
              />
            </div>
          </div>
        ))}

        {formData.orientadores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum orientador adicionado ainda.</p>
            <p className="text-sm">É obrigatório pelo menos um orientador.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Criar Novo Projeto</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center mt-4 space-x-4">
              {(user?.role === 'ORIENTADOR' ? [1, 2] : [1, 2, 3]).map((step) => (
                <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {currentStep === 1 && 'Dados do Projeto'}
            {currentStep === 2 && (user?.role === 'ORIENTADOR' ? 'Integrantes (Final)' : 'Integrantes')}
            {currentStep === 3 && 'Orientadores'}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between flex-shrink-0">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !validateStep(3)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Criando...' : 'Criar Projeto'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>   
  );
};

export default CreateProject;