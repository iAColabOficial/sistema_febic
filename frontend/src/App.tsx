import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AuthorDashboard from './pages/dashboard/AuthorDashboard';
import OrientadorDashboard from './pages/dashboard/OrientadorDashboard';
import ProjectsList from './pages/projects/ProjectsList';
import EditProject from './pages/projects/EditProject';
import Loading from './components/ui/loading';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminEvaluations from './pages/admin/AdminEvaluations';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
};

// 🎯 Função para determinar qual dashboard mostrar baseado no role
const getDashboardComponent = (userRole: string) => {
  switch (userRole) {
    case 'ADMINISTRADOR':
      return <AdminDashboard />;
    case 'ORIENTADOR':
      return <OrientadorDashboard />;
    case 'AUTOR':
      return <AuthorDashboard />;
    default:
      // Default para casos não previstos (AVALIADOR, FEIRA_AFILIADA, etc.)
      return <AuthorDashboard />;
  }
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/auth/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      
      {/* ✅ Rota do dashboard atualizada para suportar todos os roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {getDashboardComponent(user?.role || 'AUTOR')}
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/edit/:id"
        element={
          <ProtectedRoute>
            <EditProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            {user?.role === 'ADMINISTRADOR' ? <AdminUsers /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            {user?.role === 'ADMINISTRADOR' ? <AdminReports /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/evaluations"
        element={
          <ProtectedRoute>
            {user?.role === 'ADMINISTRADOR' ? <AdminEvaluations /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
};

export default App;