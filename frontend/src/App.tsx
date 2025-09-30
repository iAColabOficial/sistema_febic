// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AuthorDashboard from './pages/dashboard/AuthorDashboard';
import UnifiedDashboard from './pages/dashboard/UnifiedDashboard';
import EvaluatorDashboard from './pages/dashboard/EvaluatorDashboard';

// Project pages
import CreateProject from './pages/projects/CreateProject';
import ProjectsList from './pages/projects/ProjectsList';

// Admin pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvaluations from './pages/admin/AdminEvaluations';

import ViewProject from './pages/projects/ViewProject';

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

          {/* Protected routes - Evaluator (pode ser acessado via Unified ou direto) */}
          <Route
            path="/dashboard/evaluator"
            element={
              <ProtectedRoute allowedRoles={['AVALIADOR', 'ORIENTADOR']}>
                <EvaluatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* A visualização de projetos é feita dentro dos dashboards específicos */}
          {/* CreateProject é usado como modal, não como rota */}

          {/* Redirect root based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'AUTOR', 'ORIENTADOR', 'AVALIADOR']}>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ViewProject />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect to appropriate dashboard based on role
const DashboardRedirect: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role === 'ADMINISTRADOR') {
    return <Navigate to="/dashboard/admin" replace />;
  } else if (user.role === 'AUTOR') {
    return <Navigate to="/dashboard/author" replace />;
  } else if (user.role === 'ORIENTADOR') {
    return <Navigate to="/dashboard/orientador" replace />;
  } else if (user.role === 'AVALIADOR') {
    return <Navigate to="/dashboard/evaluator" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default App;