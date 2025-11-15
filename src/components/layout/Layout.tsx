// src/components/layout/Layout.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  Calendar,
  UserCheck,
  Settings,
  LogOut,
  ChevronDown,
  Shield,   
  FileText 
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { ChurchIcon } from '../ui/ChurchIcon';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

// ⬇️ --- ATUALIZAÇÃO 1: Papéis em MAIÚSCULAS --- ⬇️
type UserRole = 'DIRECTOR' | 'COORDINATOR' | 'VOLUNTEER' | 'both';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  role: UserRole;
  subItems?: NavigationItem[];
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ⬇️ --- ATUALIZAÇÃO 2: Puxar o objeto 'user' completo --- ⬇️
  const { user, userRole, logout } = useAuth();

  // ⬇️ --- ATUALIZAÇÃO 3: Usar dados reais do utilizador --- ⬇️
  const userName = user?.name || 'Utilizador';
  const userEmail = user?.email || 'email@paroquia.com';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  // ⬇️ --- ATUALIZAÇÃO 4: Lógica de tradução com MAIÚSCULAS --- ⬇️
  const userRoleInPortuguese = userRole === 'DIRECTOR' ? 'Diretor' : (userRole === 'COORDINATOR' ? 'Coordenador' : 'Voluntário');

  // ⬇️ --- ATUALIZAÇÃO 5: Itens de navegação com MAIÚSCULAS --- ⬇️
  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Início', icon: <Home size={20} />, path: '/', role: 'both' },
    {
      id: 'cadastros',
      label: 'Cadastros',
      icon: <Users size={20} />,
      path: '/cadastros',
      role: 'COORDINATOR', // Atualizado
      subItems: [
        { id: 'ministerios', label: 'Ministérios', icon: <Shield size={16} />, path: '/cadastros/ministerios', role: 'DIRECTOR' }, // Atualizado
        { id: 'membros', label: 'Membros', icon: <UserCheck size={16} />, path: '/cadastros/membros', role: 'COORDINATOR' }, // Atualizado
      ],
    },
    {
      id: 'escalas',
      label: 'Escalas',
      icon: <Calendar size={20} />,
      path: '/escalas',
      role: 'both',
      subItems: (userRole === 'COORDINATOR' || userRole === 'DIRECTOR')
        ? [
            { id: 'gerenciar-escalas', label: 'Gerenciar Escalas', icon: <Settings size={16} />, path: '/escalas/gerenciar', role: 'COORDINATOR' }, // Atualizado
            { id: 'visualizar-escalas', label: 'Visualizar Escalas', icon: <Calendar size={16} />, path: '/escalas', role: 'both' },
          ]
        : [
            { id: 'minhas-escalas', label: 'Minhas Escalas', icon: <Calendar size={16} />, path: '/minhas-escalas', role: 'VOLUNTEER' }, // Atualizado
            { id: 'visualizar-escalas', label: 'Todas as Escalas', icon: <Calendar size={16} />, path: '/escalas', role: 'both' },
          ],
    },
    { id: 'relatorios', label: 'Relatórios', icon: <FileText size={20} />, path: '/relatorios', role: 'COORDINATOR' }, // Atualizado
    { id: 'confirmacoes', label: 'Confirmações', icon: <UserCheck size={20} />, path: '/confirmacoes', role: 'VOLUNTEER' }, // Atualizado
  ];

  // ⬇️ --- ATUALIZAÇÃO 6: Filtro com MAIÚSCULAS --- ⬇️
  const filteredNavigation = navigationItems.filter(item => {
    if (userRole === 'DIRECTOR') {
      return item.role === 'DIRECTOR' || item.role === 'COORDINATOR' || item.role === 'both';
    }
    return item.role === 'both' || (userRole !== null && item.role === userRole);
  });

  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus(prev => (prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]));
  };

  const isActiveRoute = (path: string): boolean => {
    if (path === '/escalas') {
      return location.pathname === '/escalas';
    }
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if(sidebarOpen) setSidebarOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-280px',
        width: '280px', height: '100vh', backgroundColor: theme.colors.white,
        borderRight: `1px solid ${theme.colors.border}`, transition: 'left 0.3s ease-in-out',
        zIndex: 1000, boxShadow: sidebarOpen ? theme.shadows.lg : 'none',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* (O resto do JSX da Sidebar não muda, apenas o filtro do subItem) */}
        
        <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => handleNavigation('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: theme.colors.primary[500], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChurchIcon size={18} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: theme.colors.primary[600] }}>Sistema de Escalas</h2>
              <p style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Paróquia Santana</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: theme.colors.text.secondary }}><X size={20} /></button>
        </div>

        <nav style={{ padding: '1rem 0', flex: 1, overflowY: 'auto' }}>
          {filteredNavigation.map((item) => (
            <div key={item.id}>
              <div onClick={() => { item.subItems ? toggleSubmenu(item.id) : handleNavigation(item.path); }}
                   style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', margin: '0.25rem 0.5rem', borderRadius: theme.borderRadius.md, cursor: 'pointer', color: isActiveRoute(item.path) ? theme.colors.primary[600] : theme.colors.text.primary, backgroundColor: isActiveRoute(item.path) ? theme.colors.primary[50] : 'transparent', transition: 'all 0.2s ease-in-out' }}
                   onMouseEnter={(e) => { if (!isActiveRoute(item.path)) { e.currentTarget.style.backgroundColor = theme.colors.gray[50]; } }}
                   onMouseLeave={(e) => { if (!isActiveRoute(item.path)) { e.currentTarget.style.backgroundColor = 'transparent'; } }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.icon}
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.label}</span>
                </div>
                {item.subItems && (<ChevronDown size={16} style={{ transform: expandedMenus.includes(item.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }} />)}
              </div>
              
              {/* ⬇️ --- ATUALIZAÇÃO 7: Filtro do Submenu com MAIÚSCULAS --- ⬇️ */}
              {item.subItems && expandedMenus.includes(item.id) && (
                <div style={{ paddingLeft: '1rem' }}>
                  {item.subItems
                    .filter(subItem => { 
                      if (userRole === 'DIRECTOR') {
                        return subItem.role === 'DIRECTOR' || subItem.role === 'COORDINATOR' || subItem.role === 'both';
                      }
                      return subItem.role === 'both' || (userRole !== null && subItem.role === userRole);
                    })
                    .map((subItem) => (
                      <div key={subItem.id} onClick={() => handleNavigation(subItem.path)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', margin: '0.25rem 0.5rem', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontSize: '0.875rem', color: isActiveRoute(subItem.path) ? theme.colors.primary[600] : theme.colors.text.secondary, backgroundColor: isActiveRoute(subItem.path) ? theme.colors.primary[50] : 'transparent', transition: 'all 0.2s ease-in-out' }}
                          onMouseEnter={(e) => { if (!isActiveRoute(subItem.path)) { e.currentTarget.style.backgroundColor = theme.colors.gray[50]; } }}
                          onMouseLeave={(e) => { if (!isActiveRoute(subItem.path)) { e.currentTarget.style.backgroundColor = 'transparent'; } }}>
                        {subItem.icon}
                        <span>{subItem.label}</span>
                      </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* (O resto do JSX não muda, apenas a Navbar) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'padding-left 0.3s ease-in-out', paddingLeft: '0' }}>
        {/* Barra de Navegação Superior */}
        <div style={{ backgroundColor: theme.colors.white, borderBottom: `1px solid ${theme.colors.border}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ padding: '0.5rem', border: 'none', borderRadius: theme.borderRadius.md, backgroundColor: 'transparent', cursor: 'pointer', color: theme.colors.text.secondary }}>
              <Menu size={20} />
            </button>
            <div onClick={() => handleNavigation('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <ChurchIcon size={24} color={theme.colors.primary[500]}/>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Sistema de Escalas</h1>
            </div>
          </div>

          {/* ⬇️ --- ATUALIZAÇÃO 8: Navbar usa dados reais --- ⬇️ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: 'none', borderRadius: theme.borderRadius.md, backgroundColor: 'transparent', cursor: 'pointer' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: theme.colors.primary[500], display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.white, fontSize: '0.875rem', fontWeight: '600' }}>
                  {userInitials}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{userName}</p>
                  <p style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                    {userRoleInPortuguese}
                  </p>
                </div>
                <ChevronDown size={16} />
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '220px', backgroundColor: theme.colors.white, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.lg, boxShadow: theme.shadows.lg, zIndex: 1000 }}>
                  <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{userName}</p>
                    <p style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>{userEmail}</p>
                  </div>
                  
                  <div style={{ padding: '0.5rem' }}>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem', border: 'none', borderRadius: theme.borderRadius.md, backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.875rem', color: theme.colors.danger[600] }}>
                      <LogOut size={16} />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <main style={{ flex: 1, backgroundColor: theme.colors.background, overflow: 'auto' }}>
          {children}
        </main>
      </div>

      {sidebarOpen && (<div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }} />)}
      {userMenuOpen && (<div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 500 }} />)}
    </div>
  );
};