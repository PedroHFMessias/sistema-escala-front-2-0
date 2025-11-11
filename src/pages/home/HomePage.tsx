// src/pages/home/HomePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, UserCheck, Settings, ChevronDown, FileText, Shield } from 'lucide-react'; // ATUALIZAÇÃO 1: Imports
import { theme } from '../../styles/theme';
// import { ChurchIcon } from '../../components/ui/ChurchIcon';
import { useAuth } from '../../context/AuthContext'; // Importar useAuth

// ATUALIZAÇÃO 2: Tipos de Papel
type UserRole = 'director' | 'coordinator' | 'volunteer' | 'both';

interface MenuOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  role: UserRole; // Alterado de userType para role
  path?: string; // Adicionado para itens sem submenu
  hasSubmenu?: boolean;
  submenuItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  role: UserRole; // Adicionado role para filtrar sub-itens
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth(); // Obter o userRole do contexto
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // ATUALIZAÇÃO 3: Submenu de Cadastros agora tem papéis
  const cadastrosSubmenu: SubMenuItem[] = [
    {
      id: 'ministerios',
      title: 'Ministérios',
      description: 'Gerenciar ministérios da paróquia',
      icon: <Shield size={20} />,
      path: '/cadastros/ministerios',
      role: 'director' // Apenas Diretor
    },
    {
      id: 'membros',
      title: 'Membros',
      description: 'Gerenciar voluntários e coordenadores',
      icon: <UserCheck size={20} />,
      path: '/cadastros/membros',
      role: 'coordinator' // Diretor e Coordenador
    }
  ];

  // ATUALIZAÇÃO 4: Submenu de Escalas agora inclui 'director'
  const escalasSubmenu: SubMenuItem[] = (userRole === 'coordinator' || userRole === 'director') ? [
    {
      id: 'gerenciar-escalas',
      title: 'Gerenciar Escalas',
      icon: <Settings size={20} />,
      path: '/escalas/gerenciar',
      description: 'Criar e editar escalas',
      role: 'coordinator' // Acessível por Diretor e Coordenador
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
      role: 'volunteer'
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

  // ATUALIZAÇÃO 5: Lista Mestra de Opções de Menu
  const menuOptions: MenuOption[] = [
    {
      id: 'cadastros',
      title: 'Cadastros',
      description: 'Gerenciar ministérios e membros',
      icon: <Users size={32} />,
      color: theme.colors.primary[500],
      role: 'coordinator', // Acessível por Diretor e Coordenador
      hasSubmenu: true,
      // Filtra os sub-itens baseado no papel
      submenuItems: cadastrosSubmenu.filter(subItem => {
          if (userRole === 'director') {
            return subItem.role === 'director' || subItem.role === 'coordinator' || subItem.role === 'both';
          }
          return subItem.role === 'both' || subItem.role === userRole;
      })
    },
    {
      id: 'escalas',
      title: 'Escalas',
      description: (userRole === 'coordinator' || userRole === 'director') ? 'Criar e gerenciar escalas das missas' : 'Visualizar e confirmar suas escalas',
      icon: <Calendar size={32} />,
      color: theme.colors.secondary[500],
      role: 'both',
      hasSubmenu: true,
      submenuItems: escalasSubmenu // Já filtrado na definição acima
    },
    // ATUALIZAÇÃO 6: Novo card para Relatórios
    {
      id: 'relatorios',
      title: 'Relatórios',
      description: 'Ver dados e estatísticas das escalas',
      icon: <FileText size={32} />,
      color: theme.colors.success[500],
      role: 'coordinator', // Acessível por Diretor e Coordenador
      path: '/relatorios',
      hasSubmenu: false,
    },
    {
      id: 'confirmacoes',
      title: 'Confirmações',
      description: 'Visualizar as escalas confirmadas',
      icon: <UserCheck size={32} />,
      color: theme.colors.success[500],
      role: 'volunteer', // Apenas Voluntário
      path: '/confirmacoes',
      hasSubmenu: false,
    }
  ];

  // ATUALIZAÇÃO 7: Lógica de filtro principal (a mesma do Layout.tsx)
  const filteredOptions = menuOptions.filter(
    option => {
      if (userRole === 'director') {
        return option.role === 'director' || option.role === 'coordinator' || option.role === 'both';
      }
      return option.role === 'both' || option.role === userRole;
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

  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header Section */}
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

        {/* Main Content - Two Column Layout */}
        <div style={{
          display: 'grid',
          // ATUALIZAÇÃO 8: Layout da grade principal
          gridTemplateColumns: (userRole === 'coordinator' || userRole === 'director') ? '2fr 1fr' : '1fr 1fr',
          gap: '4rem',
          alignItems: 'start'
        }}>

          {/* Left Side - Menu Grid */}
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: (userRole === 'coordinator' || userRole ==='director') ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              position: 'relative'
            }}>
              {filteredOptions.map((option) => (
                <div key={option.id} style={{ position: 'relative' }}>
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
                    {/* ... (O restante da renderização do card permanece o mesmo) ... */}
                    
                    {/* Background Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '80px',
                      height: '80px',
                      background: `linear-gradient(135deg, ${option.color}08, ${option.color}15)`,
                      borderRadius: '0 0 0 80px'
                    }}></div>

                    {/* Icon */}
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

                    {/* Content */}
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

                    {/* Arrow indicator ou Submenu indicator */}
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
                  {/* ATUALIZAÇÃO 9: Submenu já vem filtrado */}
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
                          {/* ... (Renderização do sub-item permanece a mesma) ... */}
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
            {/* Quick Stats */}
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
                {/* ATUALIZAÇÃO 10: Mostrar stats de Coordenador também para o Diretor */}
                {(userRole === 'coordinator' || userRole === 'director') ? (
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
                          marginBottom: '0.25rem'
                        }}>
                          24
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
                          marginBottom: '0.25rem'
                        }}>
                          7
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
                          marginBottom: '0.25rem'
                        }}>
                          18
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
                    {/* Stats de Voluntário (sem alteração) */}
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
                          marginBottom: '0.25rem'
                        }}>
                          3
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: theme.colors.text.secondary
                        }}>
                          Próximas Escalas
                        </p>
                      </div>
                    </div>
                    {/* ... (outro card de voluntário) ... */}
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.xl,
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: theme.shadows.sm,
              border: `1px solid ${theme.colors.border}`
            }}>
              {/* ATUALIZAÇÃO 11: Mostrar Atividades Recentes para Diretor também */}
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {(userRole === 'coordinator' || userRole === 'director') ? 'Atividades Recentes' : 'Próximas Atividades'}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(userRole === 'coordinator' || userRole === 'director') ? (
                  <>
                    {/* ... (Atividades recentes de admin - sem alteração) ... */}
                  </>
                ) : (
                  <>
                    {/* ... (Atividades de voluntário - sem alteração) ... */}
                  </>
                )}
              </div>
            </div>

            {/* Church Info */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: `${theme.colors.secondary[500]}10`,
              borderRadius: theme.borderRadius.xl,
              border: `1px solid ${theme.colors.secondary[200]}`,
              textAlign: 'center'
            }}>
              {/* ... (Info da Igreja - sem alteração, mas a descrição é dinâmica) ... */}
              <p style={{
                fontSize: '0.8rem',
                color: theme.colors.text.secondary,
                lineHeight: '1.5',
                marginBottom: '1rem'
              }}>
                {(userRole === 'coordinator' || userRole === 'director')
                  ? 'Gerencie com eficiência todas as atividades da nossa comunidade.'
                  : 'Sua participação é essencial para nossa comunidade de fé.'
                }
              </p>
              {/* ... */}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar submenu quando clicar fora */}
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
    </div>
  );
};