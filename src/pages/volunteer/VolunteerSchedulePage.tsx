// src/pages/volunteer/VolunteerSchedulePage.tsx
import React, { useState, useEffect } from 'react';
// ⬇️ --- ATUALIZAÇÃO 1: Remover 'getStatusColor' da importação do tema --- ⬇️
import { theme } from '../../styles/theme'; 
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  MessageSquare, 
  X,
  Loader
} from 'lucide-react';
import { api } from '../../services/api';

// Interface (correta, em Inglês)
interface VolunteerSchedule {
  id: string;
  scheduleId: string;
  date: string;
  time: string;
  type: string;
  ministry: string;
  status: 'pending' | 'confirmed' | 'exchange_requested';
  notes?: string;
  requestedChangeReason?: string;
}

export const VolunteerSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<VolunteerSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Estados do Modal (sem alteração)
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [currentScheduleIdForExchange, setCurrentScheduleIdForExchange] = useState<string | null>(null);
  const [justificationMessage, setJustificationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função de carregar dados (sem alteração)
  const loadSchedules = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await api.get('/schedules/my');
      setSchedules(response.data);
    } catch (error) {
      console.error("Erro ao buscar 'minhas escalas':", error);
      setApiError("Não foi possível carregar suas escalas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  // ⬇️ --- ATUALIZAÇÃO 2: Criar uma 'getStatusColor' LOCAL que usa Inglês --- ⬇️
  const getStatusColor = (status: VolunteerSchedule['status']) => {
    switch (status) {
      case 'confirmed': return theme.colors.success[500];
      case 'pending': return theme.colors.warning[500];
      case 'exchange_requested': return theme.colors.danger[500];
      default: return theme.colors.gray[500];
    }
  };
  // ⬆️ --- FIM DA ATUALIZAÇÃO 2 --- ⬆️

  // Funções de ajuda (corretas, usam Inglês)
  const getStatusIcon = (status: VolunteerSchedule['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <AlertCircle size={16} />;
      case 'exchange_requested': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };
  const getStatusLabel = (status: VolunteerSchedule['status']) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'exchange_requested': return 'Troca Solicitada';
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

  // Funções da API (corretas, usam Inglês)
  const handleConfirm = async (participationId: string) => {
    setIsLoading(true);
    try {
      await api.put(`/schedules/participation/${participationId}/confirm`);
      setSchedules(prevSchedules =>
        prevSchedules.map(schedule =>
          schedule.id === participationId ? { ...schedule, status: 'confirmed', requestedChangeReason: undefined } : schedule
        )
      );
    } catch (error: any) {
      console.error("Erro ao confirmar:", error);
      alert(error.response?.data?.message || "Não foi possível confirmar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestChange = (participationId: string) => {
    setCurrentScheduleIdForExchange(participationId);
    setJustificationMessage('');
    setShowJustificationModal(true);
  };

  const handleConfirmExchangeRequest = async () => {
    if (!currentScheduleIdForExchange) return;
    setIsSubmitting(true);
    try {
      await api.put(`/schedules/participation/${currentScheduleIdForExchange}/request-change`, {
        justificationMessage: justificationMessage.trim() || null
      });
      
      const reason = justificationMessage.trim() || undefined;
      setSchedules(prevSchedules =>
        prevSchedules.map(schedule =>
          schedule.id === currentScheduleIdForExchange
            ? { ...schedule, status: 'exchange_requested', requestedChangeReason: reason }
            : schedule
        )
      );
      closeJustificationModal();
    } catch (error: any) {
      console.error("Erro ao solicitar troca:", error);
      alert(error.response?.data?.message || "Não foi possível solicitar a troca.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeJustificationModal = () => {
    setShowJustificationModal(false);
    setCurrentScheduleIdForExchange(null);
    setJustificationMessage('');
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
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

        {/* Lógica de Loading/Erro/Vazio (sem alteração) */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.text.secondary }}>
            <Loader size={48} style={{ margin: '0 auto 1rem', animation: 'spin 1.5s linear infinite' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>A carregar as suas escalas...</h3>
          </div>
        ) : apiError ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.danger[500] }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>Erro ao Carregar</h3>
            <p>{apiError}</p>
            <button 
              onClick={loadSchedules} 
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: theme.colors.danger[500],
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              Tentar Novamente
            </button>
          </div>
        ) : schedules.length === 0 ? (
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
                  gridTemplateColumns: '1fr 2fr 1.5fr',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease-in-out',
                  opacity: schedule.status === 'confirmed' ? 0.8 : 1,
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
                  {schedule.notes && schedule.status !== 'exchange_requested' && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: theme.colors.text.muted }}>
                      <MessageSquare size={14} style={{ minWidth: '14px', marginTop: '2px' }} />
                      <span style={{ fontStyle: 'italic' }}>{schedule.notes}</span>
                    </div>
                  )}
                  {schedule.status === 'exchange_requested' && schedule.requestedChangeReason && (
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
                    // ⬇️ --- ATUALIZAÇÃO 3: Agora usa a função local (correta) --- ⬇️
                    backgroundColor: `${getStatusColor(schedule.status)}15`,
                    color: getStatusColor(schedule.status),
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {getStatusIcon(schedule.status)}
                    {getStatusLabel(schedule.status)}
                  </div>

                  {schedule.status === 'pending' && (
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

      {/* Modal de Justificativa (sem alteração) */}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isSubmitting ? theme.colors.gray[400] : theme.colors.warning[500],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'background-color 0.2s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSubmitting && <Loader size={16} style={{ animation: 'spin 1.5s linear infinite' }} />}
                {isSubmitting ? 'A enviar...' : 'Enviar Troca'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS para a animação de spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};