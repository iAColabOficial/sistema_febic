import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Simular token da URL (em produção viria do react-router)
  useEffect(() => {
    // Simular token da URL: /forgot-password/abc123
    const urlToken = window.location.pathname.split('/').pop();
    if (urlToken && urlToken !== 'forgot-password') {
      setToken(urlToken);
      verifyToken(urlToken);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://febic.ibicsc.com.br:9444/api/auth/forgot-password/verify/${tokenToVerify}`);
      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
        setStep('reset');
      } else {
        setError(data.message || 'Token inválido');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!email) {
      setError('Email é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Enviando requisição para:', 'https://febic.ibicsc.com.br:9444/api/auth/forgot-password');
      console.log('Email:', email);

      const response = await fetch('https://febic.ibicsc.com.br:9444/api/auth/forgot-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      console.log('Status da resposta:', response.status);
      
      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (response.ok && data.success) {
        setStep('success');
        // Em desenvolvimento, simular clique no link do email
        if (data.token) {
          console.log('Token recebido:', data.token);
          setTimeout(() => {
            setToken(data.token);
            verifyToken(data.token);
          }, 3000);
        }
      } else {
        setError(data.message || `Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Erro de conexão: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://febic.ibicsc.com.br:9444/api/auth/forgot-password/reset/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Erro ao resetar senha');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    // window.location.href = '/auth/login';
    console.log('Redirect to login');
  };

  const testFlow = () => {
    setEmail('test@test.com');
    setTimeout(() => {
      handleRequestReset();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-500 hover:shadow-3xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              {step === 'success' ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : step === 'reset' ? (
                <Lock className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'success' 
                ? (token ? 'Senha Alterada!' : 'Email Enviado!') 
                : step === 'reset' 
                ? 'Nova Senha' 
                : 'Recuperar Senha'
              }
            </h1>
            <p className="text-gray-600">
              {step === 'success' 
                ? (token ? 'Sua senha foi alterada com sucesso' : 'Verifique seu email para continuar')
                : step === 'reset' 
                ? 'Defina sua nova senha' 
                : 'Digite seu email para receber o link'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Request Reset */}
          {step === 'request' && (
            <div className="space-y-6">
              {/* Botão de teste para demonstração */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <button
                  onClick={testFlow}
                  className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                >
                  🧪 Testar Fluxo Completo (Demo)
                </button>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <Button
                onClick={handleRequestReset}
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Link
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Reset Password */}
          {step === 'reset' && userData && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Definindo nova senha para: <strong>{userData.name}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">{userData.email}</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white"
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Alterando...
                  </div>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <p className="text-gray-600">
                {token ? (
                  'Sua senha foi alterada com sucesso! Agora você pode fazer login.'
                ) : (
                  <>
                    Enviamos um link para seu email. Clique no link para definir uma nova senha.
                    <br />
                    <span className="text-sm text-gray-500 mt-2 block">
                      (Em desenvolvimento, o link será simulado automaticamente em 3 segundos)
                    </span>
                  </>
                )}
              </p>
              
              {token && (
                <Button
                  onClick={goToLogin}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  Ir para Login
                </Button>
              )}
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <button
              onClick={goToLogin}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Voltar ao Login
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Recupere sua senha de forma rápida e segura
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-xs">
            FEBIC - Feira Brasileira de Iniciação Científica © 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;