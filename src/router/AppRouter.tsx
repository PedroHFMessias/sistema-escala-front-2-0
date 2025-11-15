// src/router/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout'
import { HomePage } from '../pages/home/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';

// Coordinator Pages
import { MinistryManagementPage } from '../pages/management/MinistryManagementePage';
import { MemberManagementPage } from '../pages/management/MemberManagementPage';
import { ReportsPage } from '../pages/management/ReportsPage';

// Volunteer Pages
import { VolunteerSchedulePage } from '../pages/volunteer/VolunteerSchedulePage';
import { VolunteerConfirmationPage } from '../pages/volunteer/VolunteerConfirmationPage';

// Shared Pages
import { ScheduleManagementPage } from '../pages/management/ScheduleManagementPage';
import { ScheduleViewPage } from '../pages/shared/ScheduleViewPage';

import { useAuth } from '../context/AuthContext'; 

// ⬇️ --- ATUALIZAÇÃO 1: Papéis em MAIÚSCULAS --- ⬇️
type UserRole = 'DIRECTOR' | 'COORDINATOR' | 'VOLUNTEER';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  // Agora 'userRole' vem do contexto como 'DIRECTOR', 'COORDINATOR', etc.
  const { isAuthenticated, userRole } = useAuth(); 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // A lógica de verificação de papel está correta
  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

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

        {/* ⬇️ --- ATUALIZAÇÃO 2: Papéis em MAIÚSCULAS --- ⬇️ */}

        {/* Rotas do Diretor (Acesso mais alto) */}
        <Route path="/cadastros/ministerios" element={
          <ProtectedRoute requiredRoles={['DIRECTOR']}>
            <Layout>
              <MinistryManagementPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Rotas do Diretor e Coordenador */}
        <Route path="/cadastros/membros" element={
          <ProtectedRoute requiredRoles={['DIRECTOR', 'COORDINATOR']}>
            <Layout>
              <MemberManagementPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/relatorios" element={
          <ProtectedRoute requiredRoles={['DIRECTOR', 'COORDINATOR']}>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/escalas/gerenciar" element={
          <ProtectedRoute requiredRoles={['DIRECTOR', 'COORDINATOR']}>
            <Layout>
              <ScheduleManagementPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/cadastros" element={
          <ProtectedRoute requiredRoles={['DIRECTOR', 'COORDINATOR']}>
            <Layout>
              <RoleBasedRedirect />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Volunteer Routes */}
        <Route path="/minhas-escalas" element={
          <ProtectedRoute requiredRoles={['VOLUNTEER']}>
            <Layout>
              <VolunteerSchedulePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/confirmacoes" element={
          <ProtectedRoute requiredRoles={['VOLUNTEER']}>
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
  const { userRole } = useAuth(); // userRole aqui será 'DIRECTOR' ou 'COORDINATOR'
  
  if (userRole === 'DIRECTOR') {
    return <Navigate to="/cadastros/ministerios" replace />;
  }
  if (userRole === 'COORDINATOR') {
    return <Navigate to="/cadastros/membros" replace />;
  }
  // Fallback
  return <Navigate to="/" replace />;
};