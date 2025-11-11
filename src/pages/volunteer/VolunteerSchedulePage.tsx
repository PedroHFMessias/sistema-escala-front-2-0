// src/pages/volunteer/VolunteerSchedulePage.tsx
import React, { useState } from 'react';
import { theme, getStatusColor } from '../../styles/theme'; // Importa getStatusColor do tema
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, MessageSquare, X } from 'lucide-react'; // Adicionado X para o botão fechar

// Definindo a interface para uma escala de voluntário
interface VolunteerSchedule {
  id: string;
  date: string; // Formato YYYY-MM-DD para fácil manipulação
  time: string; // Formato HH:MM
  type: string; // Ex: Missa Dominical, Via Sacra
  ministry: string; // Ex: Liturgia, Música
  status: 'pendente' | 'confirmado' | 'troca-solicitada';
  notes?: string; // Observações da escala (geral da escala, não da troca)
  requestedChangeReason?: string; // Nova: Justificativa para solicitação de troca
}

export const VolunteerSchedulePage: React.FC = () => {
  // Dados mockados das escalas do voluntário
  const [schedules, setSchedules] = useState<VolunteerSchedule[]>([
    {
      id: 'vol-sch-1',
      date: '2025-06-22', // Hoje
      time: '19:00',
      type: 'Missa Dominical',
      ministry: 'Liturgia',
      status: 'pendente',
      notes: 'Por favor, confirmar até amanhã.'
    },
    {
      id: 'vol-sch-2',
      date: '2025-06-25',
      time: '08:00',
      type: 'Missa de Semana',
      ministry: 'Música',
      status: 'confirmado',
      notes: ''
    },
    {
      id: 'vol-sch-3',
      date: '2025-06-29',
      time: '10:00',
      type: 'Missa Dominical',
      ministry: 'Acolhida',
      status: 'pendente',
      notes: 'Trazer crachá de identificação.'
    },
    {
      id: 'vol-sch-4',
      date: '2025-07-01',
      time: '19:00',
      type: 'Terço Comunitário',
      ministry: 'Acolhida',
      status: 'troca-solicitada',
      notes: 'Solicitei troca devido a compromisso familiar.', // Este notes será movido para requestedChangeReason
      requestedChangeReason: 'Compromisso familiar inadiável.' // Exemplo de como ficaria
    },
    {
      id: 'vol-sch-5',
      date: '2025-07-05',
      time: '18:00',
      type: 'Adoração ao Santíssimo',
      ministry: 'Liturgia',
      status: 'confirmado',
      notes: 'Chegar com 15 minutos de antecedência.'
    }
  ]);

  // Estados para o modal de justificativa de troca
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [currentScheduleIdForExchange, setCurrentScheduleIdForExchange] = useState<string | null>(null);
  const [justificationMessage, setJustificationMessage] = useState('');

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
    const date = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long', // Dia da semana por extenso
      day: '2-digit',
      month: 'long',   // Mês por extenso
    });
  };

  const handleConfirm = (id: string) => {
    setSchedules(prevSchedules =>
      prevSchedules.map(schedule =>
        schedule.id === id ? { ...schedule, status: 'confirmado', requestedChangeReason: undefined } : schedule
      )
    );
    alert('Escala confirmada com sucesso!');
  };

  // Abre o modal de justificativa
  const handleRequestChange = (id: string) => {
    setCurrentScheduleIdForExchange(id);
    setJustificationMessage(''); // Limpa a mensagem anterior
    setShowJustificationModal(true);
  };

  // Confirma a solicitação de troca com a justificativa
  const handleConfirmExchangeRequest = () => {
    if (currentScheduleIdForExchange) {
      setSchedules(prevSchedules =>
        prevSchedules.map(schedule =>
          schedule.id === currentScheduleIdForExchange
            ? { ...schedule, status: 'troca-solicitada', requestedChangeReason: justificationMessage.trim() || undefined }
            : schedule
        )
      );
      alert('Solicitação de troca enviada! Aguarde a aprovação do coordenador.');
      closeJustificationModal();
    }
  };

  // Fecha o modal de justificativa
  const closeJustificationModal = () => {
    setShowJustificationModal(false);
    setCurrentScheduleIdForExchange(null);
    setJustificationMessage('');
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
          Minhas Escalas
        </h1>
        <p style={{
          color: theme.colors.text.secondary,
          marginBottom: '2rem'
        }}>
          Visualize suas escalas e horários de participação. Confirme sua presença ou solicite trocas.
        </p>

        {schedules.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm
          }}>
            <Calendar size={48} color={theme.colors.text.muted} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '500',
              color: theme.colors.text.primary,
              marginBottom: '0.5rem'
            }}>
              Nenhuma escala atribuída no momento
            </h3>
            <p style={{ color: theme.colors.text.secondary }}>
              Fique atento às notificações para novas escalas!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: theme.shadows.sm,
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1.5fr auto', /* Data/Hora | Detalhes | Status/Notas | Ações */
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease-in-out',
                  opacity: schedule.status === 'confirmado' ? 0.8 : 1, // Levemente opaco se confirmado
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
                  {schedule.notes && schedule.status !== 'troca-solicitada' && ( // Mostra notes gerais, exceto se for solicitação de troca
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: theme.colors.text.muted }}>
                      <MessageSquare size={14} style={{ minWidth: '14px', marginTop: '2px' }} />
                      <span style={{ fontStyle: 'italic' }}>{schedule.notes}</span>
                    </div>
                  )}
                  {schedule.status === 'troca-solicitada' && schedule.requestedChangeReason && ( // Mostra justificativa se houver
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: theme.colors.danger[500] }}>
                      <XCircle size={14} style={{ minWidth: '14px', marginTop: '2px' }} />
                      <span style={{ fontStyle: 'italic', fontWeight: '500' }}>Justificativa: {schedule.requestedChangeReason}</span>
                    </div>
                  )}
                </div>

                {/* Status e Ações */}
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

                  {schedule.status === 'pendente' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => handleConfirm(schedule.id)}
                        style={{
                          padding: '0.6rem 1rem',
                          backgroundColor: theme.colors.success[500],
                          color: theme.colors.white,
                          border: 'none',
                          borderRadius: theme.borderRadius.md,
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.success[600]; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.colors.success[500]; }}
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleRequestChange(schedule.id)}
                        style={{
                          padding: '0.6rem 1rem',
                          backgroundColor: theme.colors.warning[500],
                          color: theme.colors.white,
                          border: 'none',
                          borderRadius: theme.borderRadius.md,
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.warning[600]; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.colors.warning[500]; }}
                      >
                        Troca
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Justificativa de Troca */}
      {showJustificationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.xl,
            boxShadow: theme.shadows.lg,
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Header do Modal */}
            <div style={{
              padding: '1.5rem',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: theme.colors.text.primary
              }}>
                Justificativa da Troca
              </h2>
              <button
                onClick={closeJustificationModal}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  color: theme.colors.gray[400]
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo do Modal - Textarea */}
            <div style={{ padding: '1.5rem' }}>
              <label htmlFor="justificativa" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme.colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Mensagem (Opcional)
              </label>
              <textarea
                id="justificativa"
                value={justificationMessage}
                onChange={(e) => setJustificationMessage(e.target.value)}
                placeholder="Ex: Não poderei comparecer devido a uma viagem de trabalho inesperada."
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Rodapé do Modal - Botões */}
            <div style={{
              padding: '1.5rem',
              borderTop: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={closeJustificationModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: theme.colors.text.secondary
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExchangeRequest}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: theme.colors.warning[500],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'background-color 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.warning[600]; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.colors.warning[500]; }}
              >
                Enviar Troca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};