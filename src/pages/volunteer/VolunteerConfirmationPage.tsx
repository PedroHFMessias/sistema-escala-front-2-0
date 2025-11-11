// src/pages/volunteer/VolunteerConfirmationPage.tsx
import React, { useState } from 'react';
import { theme, getStatusColor } from '../../styles/theme';
import { CheckCircle, AlertCircle, XCircle, Calendar, Clock, MessageSquare } from 'lucide-react';

// Reutilizando a interface de VolunteerSchedule para consistência
interface VolunteerSchedule {
  id: string;
  date: string; // Formato YYYY-MM-DD
  time: string; // Formato HH:MM
  type: string;
  ministry: string;
  status: 'pendente' | 'confirmado' | 'troca-solicitada';
  notes?: string;
  requestedChangeReason?: string;
}

export const VolunteerConfirmationPage: React.FC = () => {
  // Dados mockados das escalas do voluntário (para demonstração)
  // Usaremos uma variedade de status para testar o filtro
  const [allVolunteerSchedules] = useState<VolunteerSchedule[]>([
    {
      id: 'conf-sch-1',
      date: '2025-06-15', // Data passada
      time: '19:00',
      type: 'Missa Dominical',
      ministry: 'Liturgia',
      status: 'confirmado',
      notes: 'Chegue 15 minutos antes.'
    },
    {
      id: 'conf-sch-2',
      date: '2025-06-22', // Hoje
      time: '08:00',
      type: 'Missa Matinal',
      ministry: 'Música',
      status: 'confirmado',
      notes: ''
    },
    {
      id: 'conf-sch-3',
      date: '2025-06-29',
      time: '10:00',
      type: 'Missa Dominical',
      ministry: 'Acolhida',
      status: 'pendente', // Esta não aparecerá no filtro de "Confirmadas"
      notes: 'Escala importante!'
    },
    {
      id: 'conf-sch-4',
      date: '2025-07-01',
      time: '19:00',
      type: 'Terço Comunitário',
      ministry: 'Liturgia',
      status: 'troca-solicitada', // Esta não aparecerá no filtro de "Confirmadas"
      requestedChangeReason: 'Compromisso de última hora.'
    },
    {
      id: 'conf-sch-5',
      date: '2025-07-05',
      time: '18:00',
      type: 'Adoração ao Santíssimo',
      ministry: 'Coro',
      status: 'confirmado',
      notes: 'Hinos especiais.'
    }
  ]);

  // Filtra as escalas para mostrar APENAS as confirmadas
  const confirmedSchedules = allVolunteerSchedules.filter(
    (schedule) => schedule.status === 'confirmado'
  );

  const getStatusIcon = (status: VolunteerSchedule['status']) => {
    switch (status) {
      case 'confirmado': return <CheckCircle size={16} />;
      case 'pendente': return <AlertCircle size={16} />;
      case 'troca-solicitada': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusLabel = (status: VolunteerSchedule['status']) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'troca-solicitada': return 'Troca Solicitada';
      default: return 'Desconhecido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '600',
          color: theme.colors.text.primary,
          marginBottom: '0.5rem'
        }}>
          Minhas Confirmações
        </h1>
        <p style={{
          color: theme.colors.text.secondary,
          marginBottom: '2rem'
        }}>
          Aqui você pode visualizar as escalas que você confirmou sua participação.
        </p>

        {confirmedSchedules.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm
          }}>
            <CheckCircle size={48} color={theme.colors.text.muted} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '500',
              color: theme.colors.text.primary,
              marginBottom: '0.5rem'
            }}>
              Nenhuma escala confirmada ainda
            </h3>
            <p style={{ color: theme.colors.text.secondary }}>
              Suas escalas confirmadas aparecerão aqui. Vá em "Minhas Escalas" para confirmar novas!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {confirmedSchedules.map((schedule) => (
              <div
                key={schedule.id}
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: theme.shadows.sm,
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1.5fr', /* Data/Hora | Detalhes | Status */
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = theme.shadows.md;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.shadows.sm;
                }}
              >
                {/* Data e Hora */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: `1px solid ${theme.colors.gray[100]}`, paddingRight: '1rem' }}>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: theme.colors.primary[600] }}>
                    {formatDate(schedule.date)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                    <Clock size={16} />
                    <span>{schedule.time}</span>
                  </div>
                </div>

                {/* Detalhes da Escala */}
                <div style={{ paddingLeft: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.25rem' }}>
                    {schedule.type}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary, marginBottom: '0.5rem' }}>
                    Ministério: <span style={{ fontWeight: '500' }}>{schedule.ministry}</span>
                  </p>
                  {schedule.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: theme.colors.text.muted }}>
                      <MessageSquare size={14} style={{ minWidth: '14px', marginTop: '2px' }} />
                      <span style={{ fontStyle: 'italic' }}>{schedule.notes}</span>
                    </div>
                  )}
                </div>

                {/* Status da Confirmação */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', paddingLeft: '1rem', borderLeft: `1px solid ${theme.colors.gray[100]}` }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: `${getStatusColor(schedule.status)}15`,
                    color: getStatusColor(schedule.status),
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {getStatusIcon(schedule.status)}
                    {getStatusLabel(schedule.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};