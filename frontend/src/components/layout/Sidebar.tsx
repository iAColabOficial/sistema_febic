
// frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  FileText,
  Star,
  Target,
  TrendingUp,
  UserPlus,
  LogOut,
  Settings,
  BarChart3,
  Tent, // ✨ NOVO: Ícone de feira
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? 'bg-blue-50 text-blue-600 font-medium'
        : 'text-gray-700 hover:bg-gray-50'
    }`;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-blue-600">FEBIC</h2>
        <p className="text-sm text-gray-600 mt-1">Sistema de Gestão</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard Link (todos) */}
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* ========== ADMINISTRADOR ========== */}
        {user?.role === 'ADMINISTRADOR' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administração
              </p>
            </div>

            <Link to="/admin/users" className={linkClass('/admin/users')}>
              <Users className="w-5 h-5" />
              <span>Usuários</span>
            </Link>

            {/* ✨ NOVO: Link para Feiras Afiliadas */}
            <Link to="/admin/feiras" className={linkClass('/admin/feiras')}>
              <Tent className="w-5 h-5" />
              <span>Feiras Afiliadas</span>
            </Link>

            <Link to="/admin/evaluations" className={linkClass('/admin/evaluations')}>
              <BarChart3 className="w-5 h-5" />
              <span>Avaliações</span>
            </Link>
          </>
        )}

        {/* ========== FEIRA AFILIADA ========== */}
        {user?.role === 'FEIRA_AFILIADA' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Gestão da Feira
              </p>
            </div>

            {/* ✨ NOVO: Dashboard da Feira */}
            <Link to="/dashboard/feira" className={linkClass('/dashboard/feira')}>
              <Tent className="w-5 h-5" />
              <span>Minha Feira</span>
            </Link>

            <Link to="/dashboard/feira" className={linkClass('/dashboard/feira')}>
              <FileText className="w-5 h-5" />
              <span>Projetos Credenciados</span>
            </Link>
          </>
        )}

        {/* ========== AUTOR ========== */}
        {user?.role === 'AUTOR' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Meus Projetos
              </p>
            </div>

            <Link to="/projects/create" className={linkClass('/projects/create')}>
              <FileText className="w-5 h-5" />
              <span>Novo Projeto</span>
            </Link>

            <Link to="/projects" className={linkClass('/projects')}>
              <FileText className="w-5 h-5" />
              <span>Meus Projetos</span>
            </Link>
          </>
        )}

        {/* ========== ORIENTADOR ========== */}
        {user?.role === 'ORIENTADOR' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Orientação
              </p>
            </div>

            <Link to="/dashboard/orientador" className={linkClass('/dashboard/orientador')}>
              <Target className="w-5 h-5" />
              <span>Meus Orientandos</span>
            </Link>

            <Link to="/dashboard/evaluator" className={linkClass('/dashboard/evaluator')}>
              <Star className="w-5 h-5" />
              <span>Minhas Avaliações</span>
            </Link>
          </>
        )}

        {/* ========== AVALIADOR ========== */}
        {user?.role === 'AVALIADOR' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Avaliação
              </p>
            </div>

            <Link to="/dashboard/evaluator" className={linkClass('/dashboard/evaluator')}>
              <Star className="w-5 h-5" />
              <span>Minhas Avaliações</span>
            </Link>
          </>
        )}

        {/* ========== COORDENADOR ========== */}
        {user?.role === 'COORDENADOR_AVALIACOES' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Coordenação
              </p>
            </div>

            <Link to="/dashboard/coordinator" className={linkClass('/dashboard/coordinator')}>
              <TrendingUp className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link to="/coordinator/distribution" className={linkClass('/coordinator/distribution')}>
              <BarChart3 className="w-5 h-5" />
              <span>Distribuir Avaliações</span>
            </Link>
          </>
        )}

        {/* ========== LINKS COMUNS ========== */}
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Outros
          </p>
        </div>

        <Link to="/profile" className={linkClass('/profile')}>
          <Settings className="w-5 h-5" />
          <span>Meu Perfil</span>
        </Link>
      </nav>

      {/* ✨ NOVO: Link Público para Solicitar Afiliação */}
      <div className="p-4 border-t border-gray-200">
        <a
          href="/feira-afiliada/solicitar"
          className="flex items-center gap-3 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Tent className="w-5 h-5" />
          <span>Tornar-se Feira Afiliada</span>
        </a>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;