// src/pages/management/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';

// Interface simplificada para os dados do relatório
interface ScheduleReport {
  id: string;
  date: string;
  time: string;
  type: string;
  ministry: string; // Nome do ministério
  volunteer: string;
  status: 'confirmado' | 'pendente' | 'troca-solicitada';
  createdAt: Date;
}

interface ReportSummary {
  total: number;
  confirmed: number;
  pending: number;
  exchangeRequested: number;
}

// --- DADOS MOCKADOS ---
const mockSchedulesData: ScheduleReport[] = [
    { id: '1', date: '2025-06-01', time: '19:00', type: 'Missa Dominical', ministry: 'Coro', volunteer: 'Maria Silva', status: 'confirmado', createdAt: new Date('2025-05-20') },
    { id: '2', date: '2025-06-01', time: '19:00', type: 'Missa Dominical', ministry: 'Coro', volunteer: 'João Santos', status: 'pendente', createdAt: new Date('2025-05-20') },
    { id: '3', date: '2025-06-01', time: '08:00', type: 'Missa Matinal', ministry: 'Liturgia', volunteer: 'Pedro Oliveira', status: 'confirmado', createdAt: new Date('2025-05-21') },
    { id: '4', date: '2025-06-01', time: '08:00', type: 'Missa Matinal', ministry: 'Liturgia', volunteer: 'Carla Mendes', status: 'troca-solicitada', createdAt: new Date('2025-05-21') },
    { id: '5', date: '2025-06-02', time: '19:00', type: 'Missa Segunda', ministry: 'Acolhida', volunteer: 'Lucas Ferreira', status: 'pendente', createdAt: new Date('2025-05-22') },
    { id: '6', date: '2025-06-02', time: '19:00', type: 'Missa Segunda', ministry: 'Acolhida', volunteer: 'Beatriz Lima', status: 'confirmado', createdAt: new Date('2025-05-22') },
    { id: '7', date: '2025-06-03', time: '19:00', type: 'Missa Terça', ministry: 'Eucaristia', volunteer: 'Roberto Cruz', status: 'confirmado', createdAt: new Date('2025-05-23') },
    { id: '8', date: '2025-06-03', time: '19:00', type: 'Missa Terça', ministry: 'Eucaristia', volunteer: 'Ana Costa', status: 'troca-solicitada', createdAt: new Date('2025-05-23') }
];

const mockMinistries = [
  { id: '1', name: 'Coro' },
  { id: '2', name: 'Liturgia' },
  { id: '3', name: 'Acolhida' },
  { id: '4', name: 'Eucaristia' },
  { id: '5', name: 'Leitura' }
];
// --- FIM DOS DADOS MOCKADOS ---

export const ReportsPage: React.FC = () => {
  const { userRole } = useAuth();
  
  const [schedules, setSchedules] = useState<ScheduleReport[]>(mockSchedulesData);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');

  const allowedMinistries = React.useMemo(() => {
    if (userRole === 'director') {
      return mockMinistries; // Diretor vê todos
    }
    if (userRole === 'coordinator') {
      // Coordenador (Mock): Vê apenas Coro e Liturgia
      return mockMinistries.filter(m => m.name === 'Coro' || m.name === 'Liturgia');
    }
    return []; 
  }, [userRole]);
  
  const allowedMinistryNames = React.useMemo(() => {
    return ['Todos', ...allowedMinistries.map(m => m.name)];
  }, [allowedMinistries]);


  useEffect(() => {
    let baseData = schedules.filter(schedule =>
      allowedMinistries.some(m => m.name === schedule.ministry)
    );

    if (searchTerm) {
      baseData = baseData.filter(schedule =>
        schedule.volunteer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.ministry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMinistry !== 'Todos') {
      baseData = baseData.filter(schedule => schedule.ministry === selectedMinistry);
    }

    if (selectedStatus !== 'todos') {
      baseData = baseData.filter(schedule => schedule.status === selectedStatus);
    }

    setFilteredSchedules(baseData);
    
  }, [searchTerm, selectedMinistry, selectedStatus, schedules, allowedMinistries]);

  const getSummary = (): ReportSummary => {
    const total = filteredSchedules.length;
    const confirmed = filteredSchedules.filter(s => s.status === 'confirmado').length;
    const pending = filteredSchedules.filter(s => s.status === 'pendente').length;
    const exchangeRequested = filteredSchedules.filter(s => s.status === 'troca-solicitada').length;

    return { total, confirmed, pending, exchangeRequested };
  };

  const summary = getSummary();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return theme.colors.success[500];
      case 'pendente': return theme.colors.warning[500];
      case 'troca-solicitada': return theme.colors.danger[500];
      default: return theme.colors.gray[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle size={16} />;
      case 'pendente': return <AlertCircle size={16} />;
      case 'troca-solicitada': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'troca-solicitada': return 'Troca Solicitada';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Evitar problemas de fuso
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const handleExport = (format: string) => {
    console.log(`Exportando relatório em formato: ${format}`);
    alert(`Exportando ${filteredSchedules.length} escalas em formato ${format.toUpperCase()}`);
  };

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSchedules(mockSchedulesData);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '1rem'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '1.875rem', 
                fontWeight: '600', 
                color: theme.colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Relatório de Escalas
              </h1>
              <p style={{ 
                color: theme.colors.text.secondary,
                fontSize: '1.125rem'
              }}>
                {userRole === 'director' 
                  ? 'Visualize e exporte o status de todas as escalas' 
                  : 'Visualize e exporte o status das escalas dos seus ministérios'}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={loadData}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: theme.colors.gray[100],
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  color: theme.colors.text.primary,
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = theme.colors.gray[200];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = theme.colors.gray[100];
                  }
                }}
              >
                <RefreshCw size={16} style={{
                  animation: isLoading ? 'spin 1s linear infinite' : 'none'
                }} />
                {isLoading ? 'Carregando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* ATUALIZAÇÃO: Cards de Resumo RESTAURADOS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Total */}
          <div style={{
            backgroundColor: theme.colors.white,
            padding: '1.5rem',
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                backgroundColor: theme.colors.primary[100],
                borderRadius: '12px',
                color: theme.colors.primary[600]
              }}>
                <Users size={24} />
              </div>
              <div>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: theme.colors.text.primary }}>
                  {summary.total}
                </p>
                <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                  Total de Escalas
                </p>
              </div>
            </div>
          </div>

          {/* Confirmadas */}
          <div style={{
            backgroundColor: theme.colors.white,
            padding: '1.5rem',
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                backgroundColor: theme.colors.success[100],
                borderRadius: '12px',
                color: theme.colors.success[600]
              }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: theme.colors.text.primary }}>
                  {summary.confirmed}
                </p>
                <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                  Confirmadas ({summary.total > 0 ? Math.round((summary.confirmed / summary.total) * 100) : 0}%)
                </p>
              </div>
            </div>
          </div>

          {/* Pendentes */}
          <div style={{
            backgroundColor: theme.colors.white,
            padding: '1.5rem',
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                backgroundColor: theme.colors.warning[100],
                borderRadius: '12px',
                color: theme.colors.warning[600]
              }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: theme.colors.text.primary }}>
                  {summary.pending}
                </p>
                <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                  Pendentes ({summary.total > 0 ? Math.round((summary.pending / summary.total) * 100) : 0}%)
                </p>
              </div>
            </div>
          </div>

          {/* Trocas Solicitadas */}
          <div style={{
            backgroundColor: theme.colors.white,
            padding: '1.5rem',
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                backgroundColor: theme.colors.danger[100],
                borderRadius: '12px',
                color: theme.colors.danger[600]
              }}>
                <XCircle size={24} />
              </div>
              <div>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: theme.colors.text.primary }}>
                  {summary.exchangeRequested}
                </p>
                <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                  Trocas ({summary.total > 0 ? Math.round((summary.exchangeRequested / summary.total) * 100) : 0}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          backgroundColor: theme.colors.white,
          padding: '1.5rem',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border}`,
          marginBottom: '2rem',
          boxShadow: theme.shadows.sm
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr auto',
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* Busca */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme.colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Buscar
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.gray[400]
                }} />
                <input
                  type="text"
                  placeholder="Voluntário, celebração ou ministério..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Filtro por Ministério */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme.colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Ministério
              </label>
              <select
                value={selectedMinistry}
                onChange={(e) => setSelectedMinistry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: theme.colors.white,
                  cursor: 'pointer'
                }}
              >
                {allowedMinistryNames.map(ministryName => (
                  <option key={ministryName} value={ministryName}>
                    {ministryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme.colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: theme.colors.white,
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendente">Pendentes</option>
                <option value="troca-solicitada">Trocas Solicitadas</option>
              </select>
            </div>

            {/* Exportar */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme.colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Exportar
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleExport('pdf')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: theme.colors.danger[500],
                    color: theme.colors.white,
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.danger[600];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.danger[500];
                  }}
                  title="Exportar PDF"
                >
                  <FileText size={16} />
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: theme.colors.success[500],
                    color: theme.colors.white,
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.success[600];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.success[500];
                  }}
                  title="Exportar Excel"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ATUALIZAÇÃO: Tabela de Escalas RESTAURADA */}
        <div style={{
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.sm,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.gray[50]
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: theme.colors.text.primary
            }}>
              Escalas ({filteredSchedules.length})
            </h3>
          </div>

          {filteredSchedules.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: theme.colors.text.secondary
            }}>
              <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Nenhuma escala encontrada
              </h3>
              <p>Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.colors.gray[50] }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                      borderBottom: `1px solid ${theme.colors.border}`
                    }}>
                      Data / Horário
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                      borderBottom: `1px solid ${theme.colors.border}`
                    }}>
                      Celebração
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                      borderBottom: `1px solid ${theme.colors.border}`
                    }}>
                      Ministério
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                      borderBottom: `1px solid ${theme.colors.border}`
                    }}>
                      Voluntário
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                      borderBottom: `1px solid ${theme.colors.border}`
                    }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => (
                    <tr
                      key={schedule.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? theme.colors.white : theme.colors.gray[50]
                      }}
                    >
                      <td style={{
                        padding: '1rem',
                        borderBottom: `1px solid ${theme.colors.border}`
                      }}>
                        <div>
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: theme.colors.text.primary,
                            marginBottom: '0.25rem'
                          }}>
                            {formatDate(schedule.date)}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: theme.colors.text.secondary
                          }}>
                            {schedule.time}
                          </p>
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        fontSize: '0.875rem',
                        color: theme.colors.text.primary
                      }}>
                        {schedule.type}
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: `1px solid ${theme.colors.border}`
                      }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: theme.colors.primary[100],
                          color: theme.colors.primary[700],
                          borderRadius: theme.borderRadius.md,
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {schedule.ministry}
                        </span>
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        fontSize: '0.875rem',
                        color: theme.colors.text.primary
                      }}>
                        {schedule.volunteer}
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        textAlign: 'center'
                      }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: theme.borderRadius.md,
                          backgroundColor: `${getStatusColor(schedule.status)}15`,
                          color: getStatusColor(schedule.status),
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {getStatusIcon(schedule.status)}
                          {getStatusLabel(schedule.status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.sm
        }}>
          <div style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
            Mostrando {filteredSchedules.length} escalas
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => handleExport('pdf')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: theme.colors.primary[500],
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary[600];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary[500];
              }}
            >
              <Download size={16} />
              Baixar Relatório Completo
            </button>
          </div>
        </div>
      </div>

      {/* Loading Animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};