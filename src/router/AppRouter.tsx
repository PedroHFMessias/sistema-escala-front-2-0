// src/router/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout'
import { HomePage } from '../pages/home/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';

// Coordinator Pages
import { MinistryManagementPage } from '../pages/management/MinistryManagementePage';
import { MemberManagementPage } from '../pages/management/MemberManagementPage';
import { ReportsPage } from '../pages/management/ReportsPage'; // Adicionar ReportsPage

// Volunteer Pages
import { VolunteerSchedulePage } from '../pages/volunteer/VolunteerSchedulePage';
import { VolunteerConfirmationPage } from '../pages/volunteer/VolunteerConfirmationPage';

// Shared Pages
import { ScheduleManagementPage } from '../pages/management/ScheduleManagementPage';
import { ScheduleViewPage } from '../pages/shared/ScheduleViewPage'; // Adicionar ScheduleViewPage

import { useAuth } from '../context/AuthContext'; // Importar useAuth

// ATUALIZAÇÃO 1: Definir o tipo de papel
type UserRole = 'director' | 'coordinator' | 'volunteer';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  // ATUALIZAÇÃO 2: Aceitar um array de papéis
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, userRole } = useAuth(); // Obter do contexto

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ATUALIZAÇÃO 3: Nova lógica de verificação de papel
  // Se a rota exige papéis específicos E o papel do usuário não está incluído...
  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    // Redireciona para a home. A HomePage se adaptará ao papel.
    return <Navigate to="/" replace />;
  }

  // Se passou em ambas as verificações, renderiza a rota
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* ATUALIZAÇÃO 4: Reorganização das rotas baseada nos novos papéis
        */}

        {/* Rotas do Diretor (Acesso mais alto) */}
        <Route path="/cadastros/ministerios" element={
          <ProtectedRoute requiredRoles={['director']}>
            <Layout>
              <MinistryManagementPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Rotas do Diretor e Coordenador */}
        <Route path="/cadastros/membros" element={
          <ProtectedRoute requiredRoles={['director', 'coordinator']}>
            <Layout>
              <MemberManagementPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/relatorios" element={
          <ProtectedRoute requiredRoles={['director', 'coordinator']}>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/escalas/gerenciar" element={
          <ProtectedRoute requiredRoles={['director', 'coordinator']}>
            <Layout>
              <ScheduleManagementPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Rota "Cadastros" principal redireciona (Diretor vai para ministérios, Coordenador para membros) */}
        <Route path="/cadastros" element={
          <ProtectedRoute requiredRoles={['director', 'coordinator']}>
            <Layout>
              <RoleBasedRedirect />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Volunteer Routes */}
        <Route path="/minhas-escalas" element={
          <ProtectedRoute requiredRoles={['volunteer']}>
            <Layout>
              <VolunteerSchedulePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/confirmacoes" element={
          <ProtectedRoute requiredRoles={['volunteer']}>
            <Layout>
              <VolunteerConfirmationPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Shared Routes - (Disponível para todos os papéis logados) */}
        <Route path="/escalas" element={
          <ProtectedRoute>
            <Layout>
              <ScheduleViewPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Componente auxiliar para redirecionar /cadastros
const RoleBasedRedirect: React.FC = () => {
  const { userRole } = useAuth();
  
  if (userRole === 'director') {
    return <Navigate to="/cadastros/ministerios" replace />;
  }
  if (userRole === 'coordinator') {
    return <Navigate to="/cadastros/membros" replace />;
  }
  // Fallback, embora o ProtectedRoute já deva barrar
  return <Navigate to="/" replace />;
};