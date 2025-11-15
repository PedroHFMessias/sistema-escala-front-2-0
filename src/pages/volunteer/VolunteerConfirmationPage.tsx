// src/pages/volunteer/VolunteerConfirmationPage.tsx
import React, { useState, useEffect } from 'react'; // 1. Importado useEffect
import { theme } from '../../styles/theme'; // 2. 'getStatusColor' removido desta importação
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,  
  Clock, 
  MessageSquare,
  Loader // 3. Importado Loader
} from 'lucide-react';
import { api } from '../../services/api'; // 4. Importada a API

// 5. ATUALIZAÇÃO: Interface agora espera os termos em Inglês
interface VolunteerSchedule {
  id: string; // ID da *participação*
  date: string; // Formato YYYY-MM-DD
  time: string; // Formato HH:MM
  type: string;
  ministry: string;
  status: 'pending' | 'confirmed' | 'exchange_requested'; // <-- MUDANÇA AQUI
  notes?: string;
}

export const VolunteerConfirmationPage: React.FC = () => {
  // 6. Estados da API
  const [confirmedSchedules, setConfirmedSchedules] = useState<VolunteerSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // 7. Função para carregar os dados
  const loadConfirmations = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Chama o endpoint GET /schedules/my/confirmations
      const response = await api.get('/schedules/my/confirmations');
      setConfirmedSchedules(response.data);
    } catch (error) {
      console.error("Erro ao buscar confirmações:", error);
      setApiError("Não foi possível carregar suas escalas confirmadas.");
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Carregar dados ao montar a página
  useEffect(() => {
    loadConfirmations();
  }, []); // [] = Executa apenas uma vez

  // 9. ATUALIZAÇÃO: 'getStatusColor' agora é local e usa Inglês
  const getStatusColor = (status: VolunteerSchedule['status']) => {
    switch (status) {
      case 'confirmed': return theme.colors.success[500];
      case 'pending': return theme.colors.warning[500];
      case 'exchange_requested': return theme.colors.danger[500];
      default: return theme.colors.gray[500];
    }
  };

  // 10. ATUALIZAÇÃO: Funções de ajuda usam Inglês nos 'cases'
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
  // ⬆️ --- FIM DAS ATUALIZAÇÕES DE LÓGICA --- ⬆️

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

        {/* 11. ATUALIZAÇÃO: Lógica de Loading, Erro e Lista Vazia */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.text.secondary }}>
            <Loader size={48} style={{ margin: '0 auto 1rem', animation: 'spin 1.5s linear infinite' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>A carregar confirmações...</h3>
          </div>
        ) : apiError ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.danger[500] }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>Erro ao Carregar</h3>
            <p>{apiError}</p>
            <button 
              onClick={loadConfirmations}
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
        ) : confirmedSchedules.length === 0 ? (
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
                  gridTemplateColumns: '1fr 2fr 1.5fr',
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