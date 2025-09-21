import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, User, MapPin, GraduationCap, CheckCircle, UserPlus, ChevronRight, ChevronLeft } from "lucide-react";
import api from '@/services/api';
import toast from 'react-hot-toast';

type FebicRole = 'AUTOR' | 'ORIENTADOR';

const roleOptions = [
  { value: 'AUTOR', label: 'Autor/Estudante' },
  { value: 'ORIENTADOR', label: 'Orientador/Professor' },
];

const nivelEscolarOptions = [
  { value: 'Educação Infantil', label: 'Educação Infantil' },
  { value: 'Ensino Fundamental 1º-3º', label: 'Ensino Fundamental 1º-3º' },
  { value: 'Ensino Fundamental 4º-6º', label: 'Ensino Fundamental 4º-6º' },
  { value: 'Ensino Fundamental 7º-9º', label: 'Ensino Fundamental 7º-9º' },
  { value: 'Ensino Médio', label: 'Ensino Médio' },
  { value: 'Ensino Técnico', label: 'Ensino Técnico' },
  { value: 'EJA - Educação de Jovens e Adultos', label: 'EJA - Educação de Jovens e Adultos' },
  { value: 'Ensino Superior', label: 'Ensino Superior' },
  { value: 'Pós-graduação', label: 'Pós-graduação' },
];

const genderOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
  { value: 'Prefiro não informar', label: 'Prefiro não informar' },
];

interface FormData {
  // Dados básicos
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  phone: string;
  role: FebicRole | "";
  
  // Dados pessoais
  birthDate: string;
  gender: string;
  nationality: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Dados acadêmicos
  institution: string;
  position: string;
  formation: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    // Dados básicos
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    role: "",
    
    // Dados pessoais
    birthDate: "",
    gender: "",
    nationality: "Brasileiro",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brasil",
    
    // Dados acadêmicos
    institution: "",
    position: "",
    formation: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Formatação de campos
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatZipCode = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d{1,3})/, '$1-$2')
      .slice(0, 9);
  };

  // Validações
  const validateStep1 = useCallback(() => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Nome completo é obrigatório";
    if (!formData.email) newErrors.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email inválido";
    
    if (!formData.cpf) newErrors.cpf = "CPF é obrigatório";
    else if (formData.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos";
    
    if (!formData.phone) newErrors.phone = "Telefone é obrigatório";
    else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = "Telefone inválido";
    
    if (!formData.password) newErrors.password = "Senha é obrigatória";
    else if (formData.password.length < 6) newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "As senhas não coincidem";
    if (!formData.role) newErrors.role = "Tipo de usuário é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateStep2 = useCallback(() => {
    const newErrors: FormErrors = {};
    
    if (!formData.birthDate) newErrors.birthDate = "Data de nascimento é obrigatória";
    if (!formData.gender) newErrors.gender = "Gênero é obrigatório";
    if (!formData.address.trim()) newErrors.address = "Endereço é obrigatório";
    if (!formData.neighborhood.trim()) newErrors.neighborhood = "Bairro é obrigatório";
    if (!formData.city.trim()) newErrors.city = "Cidade é obrigatória";
    if (!formData.state.trim()) newErrors.state = "Estado é obrigatório";
    if (!formData.zipCode.trim()) newErrors.zipCode = "CEP é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateStep3 = useCallback(() => {
    const newErrors: FormErrors = {};
    
    if (!formData.institution.trim()) newErrors.institution = "Instituição é obrigatória";
    if (!formData.position) newErrors.position = "Nível escolar é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cpf') formattedValue = formatCPF(value);
    else if (name === 'phone') formattedValue = formatPhone(value);
    else if (name === 'zipCode') formattedValue = formatZipCode(value);
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const nextStep = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Preencha todos os campos obrigatórios antes de continuar');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3) return;
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        nationality: formData.nationality,
        address: formData.address,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode.replace(/\D/g, ''),
        country: formData.country,
        institution: formData.institution,
        position: formData.position,
        formation: formData.formation || null,
        role: formData.role,
      };

      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        setShowSuccess(true);
        toast.success('Cadastro realizado com sucesso!');
        
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      const message = error.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = useMemo(() => (currentStep / 3) * 100, [currentStep]);

  const stepTitles = [
    { icon: User, title: "Dados Básicos", description: "Informações pessoais principais" },
    { icon: MapPin, title: "Dados Pessoais", description: "Endereço e informações complementares" },
    { icon: GraduationCap, title: "Informações Acadêmicas", description: "Dados sobre instituição e formação" }
  ];

  const renderFormField = (
    name: keyof FormData,
    label: string,
    type: string = "text",
    placeholder: string = "",
    required: boolean = true,
    options?: Array<{ value: string; label: string }>,
    maxLength?: number
  ) => (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">{placeholder}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "password" ? (
        <div className="relative group">
          <input
            id={name}
            name={name}
            type={name === "password" ? (showPassword ? "text" : "password") : (showConfirmPassword ? "text" : "password")}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleInputChange}
            maxLength={maxLength}
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white ${
              errors[name] ? "border-red-500" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => name === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {(name === "password" ? showPassword : showConfirmPassword) ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            )}
          </button>
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleInputChange}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
        />
      )}
      {errors[name] && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {errors[name]}
        </p>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {renderFormField("name", "Nome Completo", "text", "Seu nome completo")}
      {renderFormField("email", "Email", "email", "seu@email.com")}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderFormField("cpf", "CPF", "text", "000.000.000-00")}
        {renderFormField("phone", "Telefone", "text", "(00) 00000-0000")}
      </div>
      
      {renderFormField("password", "Senha", "password", "Digite sua senha")}
      {renderFormField("confirmPassword", "Confirmar Senha", "password", "Confirme sua senha")}
      {renderFormField("role", "Tipo de Usuário", "select", "Selecione seu tipo de usuário", true, roleOptions)}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderFormField("birthDate", "Data de Nascimento", "date")}
        {renderFormField("gender", "Gênero", "select", "Selecione seu gênero", true, genderOptions)}
      </div>
      
      {renderFormField("address", "Endereço", "text", "Rua Exemplo, 123")}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderFormField("neighborhood", "Bairro", "text", "Bairro Exemplo")}
        {renderFormField("zipCode", "CEP", "text", "12345-678")}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {renderFormField("city", "Cidade", "text", "Cidade Exemplo")}
        {renderFormField("state", "Estado", "text", "SP", true, undefined, 2)}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {renderFormField("institution", "Instituição", "text", "Nome da escola, universidade ou instituição")}
      {renderFormField("position", "Nível Escolar", "select", "Selecione seu nível", true, nivelEscolarOptions)}
      {renderFormField("formation", "Formação Acadêmica", "text", "Ex: Licenciatura em Biologia (opcional)", false)}
    </div>
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h1>
            <p className="text-gray-600">
              Sua conta foi criada com sucesso. Redirecionando para o login...
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-sm text-gray-500">
            Você será redirecionado em alguns segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Criar Conta na FEBIC</h1>
            <p className="text-center text-white/90 text-sm">
              {stepTitles[currentStep - 1].description}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              {stepTitles.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === index + 1;
                const isCompleted = currentStep > index + 1;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-primary-500 text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    {index < stepTitles.length - 1 && (
                      <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
                        currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">{stepTitles[currentStep - 1].title}</h3>
              <p className="text-sm text-gray-600">Passo {currentStep} de 3</p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-8">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </button>
              )}
              
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="ml-auto flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="ml-auto flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Criar Conta
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Footer Links */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Fazer login
              </Link>
            </p>
            
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Voltar à página inicial
            </Link>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Ao criar uma conta, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;