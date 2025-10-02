// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AuthorDashboard from './pages/dashboard/AuthorDashboard';
import UnifiedDashboard from './pages/dashboard/UnifiedDashboard';
import EvaluatorDashboard from './pages/dashboard/EvaluatorDashboard';
import { CoordinatorDashboard } from './pages/dashboard/CoordinatorDashboard';
import { FeiraDashboard } from './pages/dashboard/FeiraDashboard';

// Project pages
import ViewProject from './pages/projects/ViewProject';

// Admin pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvaluations from './pages/admin/AdminEvaluations';
import { AdminFeiras } from './pages/admin/AdminFeiras';

// Feira Afiliada pages
import { SolicitarAfiliacao } from './pages/feira-afiliada/SolicitarAfiliacao';

// Home
import Home from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          
          {/* Feira Afiliada - Rota pública para solicitação */}
          <Route path="/feira-afiliada/solicitar" element={<SolicitarAfiliacao />} />

          {/* Protected routes - Admin */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/evaluations"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
                <AdminEvaluations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feiras"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
                <AdminFeiras />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Coordinator */}
          <Route
            path="/dashboard/coordinator"
            element={
              <ProtectedRoute allowedRoles={['COORDENADOR_AVALIACOES']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Feira Afiliada */}
          <Route
            path="/dashboard/feira"
            element={
              <ProtectedRoute allowedRoles={['FEIRA_AFILIADA', 'ADMINISTRADOR']}>
                <FeiraDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Author */}
          <Route
            path="/dashboard/author"
            element={
              <ProtectedRoute allowedRoles={['AUTOR']}>
                <AuthorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Orientador (Unified Dashboard) */}
          <Route
            path="/dashboard/orientador"
            element={
              <ProtectedRoute allowedRoles={['ORIENTADOR']}>
                <UnifiedDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Evaluator */}
          <Route
            path="/dashboard/evaluator"
            element={
              <ProtectedRoute allowedRoles={['AVALIADOR', 'ORIENTADOR']}>
                <EvaluatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Project view */}
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ViewProject />
              </ProtectedRoute>
            }
          />

          {/* Redirect root based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'AUTOR', 'ORIENTADOR', 'AVALIADOR', 'COORDENADOR_AVALIACOES', 'FEIRA_AFILIADA']}>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect to appropriate dashboard based on role
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  useEffect(() => {
    setHasRedirected(true);
  }, []);

  // Aguarda carregamento do usuário
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Previne múltiplos redirects
  if (!hasRedirected) {
    return null;
  }
  
  if (user.role === 'ADMINISTRADOR') {
    return <Navigate to="/dashboard/admin" replace />;
  } else if (user.role === 'AUTOR') {
    return <Navigate to="/dashboard/author" replace />;
  } else if (user.role === 'ORIENTADOR') {
    return <Navigate to="/dashboard/orientador" replace />;
  } else if (user.role === 'AVALIADOR') {
    return <Navigate to="/dashboard/evaluator" replace />;
  } else if (user.role === 'COORDENADOR_AVALIACOES') {
    return <Navigate to="/dashboard/coordinator" replace />;
  } else if (user.role === 'FEIRA_AFILIADA') {
    return <Navigate to="/dashboard/feira" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default App;