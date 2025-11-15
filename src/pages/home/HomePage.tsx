// src/pages/home/HomePage.tsx
import React, { useState, useEffect } from 'react'; // 1. Importa useEffect
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, UserCheck, Settings, ChevronDown, FileText, Shield, Loader } from 'lucide-react'; // 2. Importa Loader
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext'; 
import { api } from '../../services/api'; // 3. Importa a API

// ... (interfaces MenuOption, SubMenuItem, UserRole - sem alterações) ...
type UserRole = 'DIRECTOR' | 'COORDINATOR' | 'VOLUNTEER' | 'both';

interface MenuOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  role: UserRole; 
  path?: string; 
  hasSubmenu?: boolean;
  submenuItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  role: UserRole;
}

// 4. Interface para os stats (números)
interface DashboardStats {
  voluntariosAtivos?: number;
  escalasPendentes?: number;
  confirmacoesHoje?: number;
  proximasEscalas?: number;
  pendenteConfirmacao?: number;
}


export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth(); 
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  
  // 5. Estado para os stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // 6. useEffect para buscar os stats da API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await api.get('/dashboard/summary');
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar stats do dashboard:", error);
        // Define stats como 0 em caso de erro
        setStats(
          userRole === 'VOLUNTEER' 
            ? { proximasEscalas: 0, pendenteConfirmacao: 0 }
            : { voluntariosAtivos: 0, escalasPendentes: 0, confirmacoesHoje: 0 }
        );
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [userRole]); // Recarrega se o papel do utilizador mudar

  // ... (Definições de cadastrosSubmenu, escalasSubmenu, menuOptions, filteredOptions - sem alterações) ...
  // (Copie as definições que já corrigimos na resposta anterior)
  const cadastrosSubmenu: SubMenuItem[] = [
    {
      id: 'ministerios',
      title: 'Ministérios',
      description: 'Gerenciar ministérios da paróquia',
      icon: <Shield size={20} />,
      path: '/cadastros/ministerios',
      role: 'DIRECTOR'
    },
    {
      id: 'membros',
      title: 'Membros',
      description: userRole === 'DIRECTOR' ? 'Gerenciar voluntários e coordenadores' : 'Gerenciar voluntários',
      icon: <UserCheck size={20} />,
      path: '/cadastros/membros',
      role: 'COORDINATOR'
    }
  ];

  const escalasSubmenu: SubMenuItem[] = (userRole === 'COORDINATOR' || userRole === 'DIRECTOR') ? [
    {
      id: 'gerenciar-escalas',
      title: 'Gerenciar Escalas',
      icon: <Settings size={20} />,
      path: '/escalas/gerenciar',
      description: 'Criar e editar escalas',
      role: 'COORDINATOR'
    },
    {
      id: 'visualizar-escalas',
      title: 'Visualizar Escalas',
      description: 'Ver todas as escalas',
      icon: <Calendar size={20} />,
      path: '/escalas',
      role: 'both'
    }
  ] : [
    {
      id: 'minhas-escalas',
      title: 'Minhas Escalas',
      description: 'Ver minhas escalas',
      icon: <Calendar size={20} />,
      path: '/minhas-escalas',
      role: 'VOLUNTEER'
    },
    {
      id: 'visualizar-escalas',
      title: 'Todas as Escalas',
      description: 'Ver escalas da paróquia',
      icon: <Calendar size={20} />,
      path: '/escalas',
      role: 'both'
    }
  ];

  const menuOptions: MenuOption[] = [
    {
      id: 'cadastros',
      title: 'Cadastros',
      description: userRole === 'DIRECTOR' ? 'Gerenciar ministérios e membros' : 'Gerenciar voluntários',
      icon: <Users size={32} />,
      color: theme.colors.primary[500],
      role: 'COORDINATOR',
      hasSubmenu: true,
      submenuItems: cadastrosSubmenu.filter(subItem => {
          if (userRole === 'DIRECTOR') {
            return subItem.role === 'DIRECTOR' || subItem.role === 'COORDINATOR' || subItem.role === 'both';
          }
          return subItem.role === 'both' || (userRole !== null && subItem.role === userRole);
      })
    },
    {
      id: 'escalas',
      title: 'Escalas',
      description: (userRole === 'COORDINATOR' || userRole === 'DIRECTOR') ? 'Criar e gerenciar escalas das missas' : 'Visualizar e confirmar suas escalas',
      icon: <Calendar size={32} />,
      color: theme.colors.secondary[500],
      role: 'both',
      hasSubmenu: true,
      submenuItems: escalasSubmenu
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      description: 'Ver dados e estatísticas das escalas',
      icon: <FileText size={32} />,
      color: theme.colors.success[500], 
      role: 'COORDINATOR',
      path: '/relatorios',
      hasSubmenu: false,
    },
    {
      id: 'confirmacoes',
      title: 'Confirmações',
      description: 'Visualizar as escalas confirmadas',
      icon: <UserCheck size={32} />,
      color: theme.colors.success[500],
      role: 'VOLUNTEER',
      path: '/confirmacoes',
      hasSubmenu: false,
    }
  ];

  const filteredOptions = menuOptions.filter(
    option => {
      if (userRole === 'DIRECTOR') {
        return option.role === 'DIRECTOR' || option.role === 'COORDINATOR' || option.role === 'both';
      }
      return option.role === 'both' || (userRole !== null && option.role === userRole);
    }
  );

  const handleOptionClick = (option: MenuOption) => {
    if (option.hasSubmenu) {
      setOpenSubmenu(openSubmenu === option.id ? null : option.id);
    } else if (option.path) {
        navigate(option.path);
    }
  };

  const handleSubmenuClick = (path: string) => {
    navigate(path);
    setOpenSubmenu(null);
  };
  
  // 7. Componente de Loading para os stats
  const StatNumber: React.FC<{ value?: number }> = ({ value }) => {
    if (isLoadingStats) {
      return (
        <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
      );
    }
    return <>{value ?? 0}</>;
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header Section (sem alterações) */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginBottom: '1rem'
          }}>
            Bem-vindo ao Sistema de Escalas
          </h2>
          <p style={{
            color: theme.colors.text.secondary,
            fontSize: '1.125rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Gerencie as escalas da Paróquia Santana de forma simples e eficiente. Selecione uma opção abaixo para começar.
          </p>
        </div>

        {/* Main Content - Two Column Layout (sem alterações) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: (userRole === 'COORDINATOR' || userRole === 'DIRECTOR') ? '2fr 1fr' : '1fr 1fr',
          gap: '4rem',
          alignItems: 'start'
        }}>

          {/* Left Side - Menu Grid (sem alterações) */}
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: (userRole === 'COORDINATOR' || userRole ==='DIRECTOR') ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              position: 'relative'
            }}>
              {filteredOptions.map((option) => (
                <div key={option.id} style={{ position: 'relative' }}>
                  {/* (Todo o JSX dos cartões de menu e submenus permanece o mesmo) */}
                   <div
                    onClick={() => handleOptionClick(option)}
                    style={{
                      backgroundColor: theme.colors.white,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.xl,
                      padding: '2rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: theme.shadows.sm,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '1.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '200px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = theme.shadows.lg;
                      e.currentTarget.style.borderColor = option.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = theme.shadows.sm;
                      e.currentTarget.style.borderColor = theme.colors.border;
                    }}
                  >
                    
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '80px',
                      height: '80px',
                      background: `linear-gradient(135deg, ${option.color}08, ${option.color}15)`,
                      borderRadius: '0 0 0 80px'
                    }}></div>

                    <div
                      style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        backgroundColor: `${option.color}15`,
                        color: option.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      {option.icon}
                    </div>

                    <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                        marginBottom: '0.75rem'
                      }}>
                        {option.title}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: theme.colors.text.secondary,
                        lineHeight: '1.5'
                      }}>
                        {option.description}
                      </p>
                    </div>

                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: `${option.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {option.hasSubmenu ? (
                        <ChevronDown
                          size={16}
                          color={option.color}
                          style={{
                            transform: openSubmenu === option.id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease-in-out'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRight: `2px solid ${option.color}`,
                          borderBottom: `2px solid ${option.color}`,
                          transform: 'rotate(-45deg)',
                          marginLeft: '2px'
                        }}></div>
                      )}
                    </div>

                  </div>

                  {/* Submenu Dropdown */}
                  {option.hasSubmenu && openSubmenu === option.id && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '0.5rem',
                      backgroundColor: theme.colors.white,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.lg,
                      boxShadow: theme.shadows.lg,
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      {option.submenuItems?.map((subItem, index) => (
                        <div
                          key={subItem.id}
                          onClick={() => handleSubmenuClick(subItem.path)}
                          style={{
                            padding: '1rem',
                            cursor: 'pointer',
                            borderBottom: index < option.submenuItems!.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                            transition: 'background-color 0.2s ease-in-out',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.gray[50];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            backgroundColor: `${option.color}15`,
                            color: option.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {subItem.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: theme.colors.text.primary,
                              marginBottom: '0.25rem'
                            }}>
                              {subItem.title}
                            </h4>
                            <p style={{
                              fontSize: '0.75rem',
                              color: theme.colors.text.secondary,
                              lineHeight: '1.4'
                            }}>
                              {subItem.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Info Panel */}
          <div>
            {/* 8. ATUALIZAÇÃO: Quick Stats agora usam os dados da API */}
            <div style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.xl,
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: theme.shadows.sm,
              border: `1px solid ${theme.colors.border}`
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Resumo Rápido
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(userRole === 'COORDINATOR' || userRole === 'DIRECTOR') ? (
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: theme.colors.primary[50],
                      borderRadius: theme.borderRadius.lg,
                      border: `1px solid ${theme.colors.primary[200]}`
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: theme.colors.primary[500],
                        color: 'white'
                      }}>
                        <Users size={20} />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: theme.colors.primary[600],
                          marginBottom: '0.25rem',
                          height: '24px' // Altura fixa para evitar "pulos"
                        }}>
                          <StatNumber value={stats?.voluntariosAtivos} />
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: theme.colors.text.secondary
                        }}>
                          Voluntários Ativos
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: theme.colors.secondary[50],
                      borderRadius: theme.borderRadius.lg,
                      border: `1px solid ${theme.colors.secondary[200]}`
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: theme.colors.secondary[500],
                        color: 'white'
                      }}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: theme.colors.secondary[600],
                          marginBottom: '0.25rem',
                          height: '24px'
                        }}>
                          <StatNumber value={stats?.escalasPendentes} />
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: theme.colors.text.secondary
                        }}>
                          Escalas Pendentes
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: theme.colors.success[50],
                      borderRadius: theme.borderRadius.lg,
                      border: `1px solid ${theme.colors.success[200]}`
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: theme.colors.success[500],
                        color: 'white'
                      }}>
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: theme.colors.success[600],
                          marginBottom: '0.25rem',
                          height: '24px'
                        }}>
                          <StatNumber value={stats?.confirmacoesHoje} />
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: theme.colors.text.secondary
                        }}>
                          Confirmações Hoje
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: theme.colors.primary[50],
                      borderRadius: theme.borderRadius.lg,
                      border: `1px solid ${theme.colors.primary[200]}`
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: theme.colors.primary[500],
                        color: 'white'
                      }}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: theme.colors.primary[600],
                          marginBottom: '0.25rem',
                          height: '24px'
                        }}>
                          <StatNumber value={stats?.proximasEscalas} />
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: theme.colors.text.secondary
                        }}>
                          Próximas Escalas
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: theme.colors.warning[50],
                      borderRadius: theme.borderRadius.lg,
                      border: `1px solid ${theme.colors.warning[200]}`
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: theme.colors.warning[500],
                        color: 'white'
                      }}>
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: theme.colors.warning[600],
                          marginBottom: '0.25rem',
                          height: '24px'
                        }}>
                          <StatNumber value={stats?.pendenteConfirmacao} />
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: theme.colors.text.secondary
                        }}>
                          Pendente Confirmação
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay (sem alterações) */}
      {openSubmenu && (
        <div
          onClick={() => setOpenSubmenu(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
      
      {/* 9. Animação de spin para o Loader */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};