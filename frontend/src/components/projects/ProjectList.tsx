import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, Send, Plus, X, Users, GraduationCap } from 'lucide-react';
import { 
  CreateProjectRequest, 
  CATEGORY_INFO, 
  PROJECT_CATEGORIES,
  ProjectCategory,
  AreaConhecimento
} from '@/types/Project';

// ✅ CORRIGIDO: Interfaces tipadas corretamente
interface Member {
  name: string;
  email?: string;
  cpf?: string;
  birthDate: string;
  gender: string;
  phone?: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  schoolLevel: string;
  schoolYear?: string;
  institution: string;
  isIndigenous: boolean;
  hasDisability: boolean;
  isRural: boolean;
}

interface Orientador {
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  formation: string;
  area: string;
  institution: string;
  position?: string;
  city: string;
  state: string;
  yearsExperience?: number;
  lattesUrl?: string;
}

// ✅ CORRIGIDO: Hook simulado - substitua pela implementação real
const useProjects = () => ({
  createProject: async (data: CreateProjectRequest) => {
    // Implementação real aqui
    console.log('Creating project:', data);
    return Promise.resolve({ id: 'temp-id', ...data });
  }
});

const useAreasConhecimento = () => ({
  areas: [
    { id: '1', sigla: 'CNE', nome: 'Ciências Exatas e da Terra', nivel: 1 },
    { id: '2', sigla: 'CB', nome: 'Ciências Biológicas', nivel: 1 },
    { id: '3', sigla: 'ENG', nome: 'Engenharias', nivel: 1 },
    { id: '4', sigla: 'CS', nome: 'Ciências da Saúde', nivel: 1 },
    { id: '5', sigla: 'CA', nome: 'Ciências Agrárias', nivel: 1 },
    { id: '6', sigla: 'CSA', nome: 'Ciências Sociais Aplicadas', nivel: 1 },
    { id: '7', sigla: 'CH', nome: 'Ciências Humanas', nivel: 1 },
    { id: '8', sigla: 'LLA', nome: 'Linguística, Letras e Artes', nivel: 1 }
  ] as AreaConhecimento[],
  loading: false
});

// ✅ CORRIGIDO: Toast simulado - substitua pela implementação real
const toast = {
  error: (message: string) => console.error('Toast Error:', message),
  success: (message: string) => console.log('Toast Success:', message)
};

export const CreateProject = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const { areas, loading: areasLoading } = useAreasConhecimento();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Dados do projeto
  const [projectData, setProjectData] = useState<Partial<CreateProjectRequest>>({
    title: '',
    summary: '',
    objective: '',
    methodology: '',
    results: '',
    conclusion: '',
    bibliography: '',
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
    socialVulnerability: false
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [orientadores, setOrientadores] = useState<Orientador[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // ✅ CORRIGIDO: Validações por etapa tipadas corretamente
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(projectData.title && projectData.summary && projectData.category && projectData.areaConhecimentoId);
      case 2:
        return !!(projectData.objective && projectData.methodology);
      case 3:
        return !!(projectData.institution && projectData.institutionCity && projectData.institutionState);
      case 4:
        return members.length > 0 && orientadores.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Preencha todos os campos obrigatórios antes de continuar');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !projectData.keywords?.includes(keywordInput.trim())) {
      setProjectData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  // ✅ CORRIGIDO: Função tipada corretamente
  const removeKeyword = (keyword: string) => {
    setProjectData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const addMember = () => {
    setMembers(prev => [...prev, {
      name: '',
      email: '',
      cpf: '',
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
    }]);
  };

  // ✅ CORRIGIDO: Função tipada corretamente  
  const updateMember = (index: number, field: keyof Member, value: string | boolean) => {
    setMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  };

  const removeMember = (index: number) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const addOrientador = () => {
    setOrientadores(prev => [...prev, {
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
    }]);
  };

  // ✅ CORRIGIDO: Função tipada corretamente
  const updateOrientador = (index: number, field: keyof Orientador, value: string | number) => {
    setOrientadores(prev => prev.map((orientador, i) => 
      i === index ? { ...orientador, [field]: value } : orientador
    ));
  };

  const removeOrientador = (index: number) => {
    setOrientadores(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Verifique todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const project = await createProject({
        ...projectData,
        members,
        orientadores
      } as CreateProjectRequest);
      if (project) {
        toast.success('Projeto criado com sucesso!');
        navigate('/projects');
      }
    } catch (error) {
      toast.error('Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRIGIDO: Select simplificado
  const SimpleSelect = ({ value, onChange, children, placeholder }: {
    value?: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
    placeholder?: string;
  }) => (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );

  // Renderização das etapas
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Título do Projeto *</Label>
              <Input
                id="title"
                value={projectData.title || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título do seu projeto"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="summary">Resumo *</Label>
              <Textarea
                id="summary"
                value={projectData.summary || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Descreva resumidamente seu projeto (máximo 250 palavras)"
                className="mt-2 min-h-[120px]"
                maxLength={2000}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <SimpleSelect
                value={projectData.category}
                onChange={(value) => setProjectData(prev => ({ ...prev, category: value as ProjectCategory }))}
                placeholder="Selecione a categoria"
              >
                {PROJECT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </SimpleSelect>
            </div>

            <div>
              <Label htmlFor="areaConhecimento">Área do Conhecimento *</Label>
              <SimpleSelect
                value={projectData.areaConhecimentoId}
                onChange={(value) => setProjectData(prev => ({ ...prev, areaConhecimentoId: value }))}
                placeholder="Selecione a área do conhecimento"
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.sigla} - {area.nome}
                  </option>
                ))}
              </SimpleSelect>
            </div>

            <div>
              <Label htmlFor="researchLine">Linha de Pesquisa</Label>
              <Input
                id="researchLine"
                value={projectData.researchLine || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, researchLine: e.target.value }))}
                placeholder="Ex: Educação Ambiental, Robótica Educacional"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Palavras-chave</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Digite uma palavra-chave"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                />
                <Button type="button" onClick={addKeyword} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {projectData.keywords?.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {keyword}
                    <X 
                      className="h-3 w-3 ml-1" 
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="objective">Objetivo *</Label>
              <Textarea
                id="objective"
                value={projectData.objective || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, objective: e.target.value }))}
                placeholder="Descreva o objetivo principal do projeto"
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="methodology">Metodologia *</Label>
              <Textarea
                id="methodology"
                value={projectData.methodology || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, methodology: e.target.value }))}
                placeholder="Descreva a metodologia utilizada"
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="results">Resultados</Label>
              <Textarea
                id="results"
                value={projectData.results || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, results: e.target.value }))}
                placeholder="Descreva os resultados obtidos"
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="conclusion">Conclusão</Label>
              <Textarea
                id="conclusion"
                value={projectData.conclusion || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, conclusion: e.target.value }))}
                placeholder="Descreva as conclusões do projeto"
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="bibliography">Bibliografia</Label>
              <Textarea
                id="bibliography"
                value={projectData.bibliography || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, bibliography: e.target.value }))}
                placeholder="Liste as referências bibliográficas"
                className="mt-2 min-h-[120px]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="institution">Instituição de Ensino *</Label>
              <Input
                id="institution"
                value={projectData.institution || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="Nome da escola/universidade"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institutionCity">Cidade *</Label>
                <Input
                  id="institutionCity"
                  value={projectData.institutionCity || ''}
                  onChange={(e) => setProjectData(prev => ({ ...prev, institutionCity: e.target.value }))}
                  placeholder="Cidade da instituição"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="institutionState">Estado *</Label>
                <Input
                  id="institutionState"
                  value={projectData.institutionState || ''}
                  onChange={(e) => setProjectData(prev => ({ ...prev, institutionState: e.target.value }))}
                  placeholder="UF"
                  className="mt-2"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Características da Instituição</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublicSchool"
                  checked={projectData.isPublicSchool}
                  onCheckedChange={(checked) => setProjectData(prev => ({ ...prev, isPublicSchool: checked }))}
                />
                <Label htmlFor="isPublicSchool">Escola Pública</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRuralSchool"
                  checked={projectData.isRuralSchool}
                  onCheckedChange={(checked) => setProjectData(prev => ({ ...prev, isRuralSchool: checked }))}
                />
                <Label htmlFor="isRuralSchool">Escola Rural</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isIndigenous"
                  checked={projectData.isIndigenous}
                  onCheckedChange={(checked) => setProjectData(prev => ({ ...prev, isIndigenous: checked }))}
                />
                <Label htmlFor="isIndigenous">Escola Indígena</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDisability"
                  checked={projectData.hasDisability}
                  onCheckedChange={(checked) => setProjectData(prev => ({ ...prev, hasDisability: checked }))}
                />
                <Label htmlFor="hasDisability">Atende pessoas com deficiência</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="socialVulnerability"
                  checked={projectData.socialVulnerability}
                  onCheckedChange={(checked) => setProjectData(prev => ({ ...prev, socialVulnerability: checked }))}
                />
                <Label htmlFor="socialVulnerability">Área de vulnerabilidade social</Label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            {/* Membros da Equipe */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <Label className="text-lg font-medium">Membros da Equipe</Label>
                </div>
                <Button type="button" onClick={addMember} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              </div>

              {members.map((member, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">Membro {index + 1}</CardTitle>
                    <Button
                      type="button"
                      onClick={() => removeMember(index)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome *</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        placeholder="Nome completo"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                        placeholder="email@exemplo.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Data de Nascimento *</Label>
                      <Input
                        type="date"
                        value={member.birthDate}
                        onChange={(e) => updateMember(index, 'birthDate', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Nível Escolar *</Label>
                      <Input
                        value={member.schoolLevel}
                        onChange={(e) => updateMember(index, 'schoolLevel', e.target.value)}
                        placeholder="Ex: 8º ano, 3º ano EM"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Cidade *</Label>
                      <Input
                        value={member.city}
                        onChange={(e) => updateMember(index, 'city', e.target.value)}
                        placeholder="Cidade"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Estado *</Label>
                      <Input
                        value={member.state}
                        onChange={(e) => updateMember(index, 'state', e.target.value)}
                        placeholder="UF"
                        className="mt-1"
                        maxLength={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {members.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum membro adicionado ainda</p>
                  <p className="text-sm">Clique em "Adicionar Membro" para começar</p>
                </div>
              )}
            </div>

            {/* Orientadores */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <Label className="text-lg font-medium">Orientadores</Label>
                </div>
                <Button type="button" onClick={addOrientador} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Orientador
                </Button>
              </div>

              {orientadores.map((orientador, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">Orientador {index + 1}</CardTitle>
                    <Button
                      type="button"
                      onClick={() => removeOrientador(index)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome *</Label>
                      <Input
                        value={orientador.name}
                        onChange={(e) => updateOrientador(index, 'name', e.target.value)}
                        placeholder="Nome completo"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        value={orientador.email}
                        onChange={(e) => updateOrientador(index, 'email', e.target.value)}
                        placeholder="email@exemplo.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Formação *</Label>
                      <Input
                        value={orientador.formation}
                        onChange={(e) => updateOrientador(index, 'formation', e.target.value)}
                        placeholder="Ex: Mestrado em Biologia"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Área de Atuação *</Label>
                      <Input
                        value={orientador.area}
                        onChange={(e) => updateOrientador(index, 'area', e.target.value)}
                        placeholder="Ex: Ciências Biológicas"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Instituição *</Label>
                      <Input
                        value={orientador.institution}
                        onChange={(e) => updateOrientador(index, 'institution', e.target.value)}
                        placeholder="Nome da instituição"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Link Lattes</Label>
                      <Input
                        value={orientador.lattesUrl}
                        onChange={(e) => updateOrientador(index, 'lattesUrl', e.target.value)}
                        placeholder="http://lattes.cnpq.br/..."
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {orientadores.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum orientador adicionado ainda</p>
                  <p className="text-sm">Clique em "Adicionar Orientador" para começar</p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Revisar Projeto</h3>
              <p className="text-gray-500 mb-6">
                Revise todas as informações antes de enviar seu projeto
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="font-medium">Título:</dt>
                      <dd className="text-gray-600">{projectData.title}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Categoria:</dt>
                      <dd className="text-gray-600">
                        {projectData.category && CATEGORY_INFO[projectData.category]?.label}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Resumo:</dt>
                      <dd className="text-gray-600 line-clamp-3">{projectData.summary}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Instituição</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="font-medium">Nome:</dt>
                      <dd className="text-gray-600">{projectData.institution}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Localização:</dt>
                      <dd className="text-gray-600">
                        {projectData.institutionCity}, {projectData.institutionState}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Membros ({members.length})</h4>
                      {members.map((member, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {member.name} - {member.schoolLevel}
                        </p>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Orientadores ({orientadores.length})</h4>
                      {orientadores.map((orientador, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {orientador.name} - {orientador.formation}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Próximos Passos</h4>
              <p className="text-blue-700 text-sm">
                Após enviar o projeto, ele ficará com status "Rascunho" e você poderá editá-lo até decidir submetê-lo para avaliação.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criar Novo Projeto</h1>
        <p className="text-gray-500">
          Etapa {currentStep} de {totalSteps}
        </p>
        <Progress value={progress} className="mt-4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Informações Básicas'}
            {currentStep === 2 && 'Desenvolvimento Científico'}
            {currentStep === 3 && 'Dados Institucionais'}
            {currentStep === 4 && 'Equipe do Projeto'}
            {currentStep === 5 && 'Revisão Final'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {/* Salvar como rascunho */}}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Criar Projeto'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};