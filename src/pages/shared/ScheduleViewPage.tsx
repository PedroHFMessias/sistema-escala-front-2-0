// src/pages/shared/ScheduleViewPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Loader
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { api } from '../../services/api';

// Interface (sem alteração)
interface ScheduleData {
  id: string;
  date: string;
  time: string;
  type: string;
  ministry: string;
  volunteer: string;
  status: 'pending' | 'confirmed' | 'exchange_requested';
}

// ⬇️ --- ATUALIZAÇÃO 1: REMOVER A LISTA MOCKADA --- ⬇️
// const ministries = ['Todos', 'Coro', 'Liturgia', ...]; // Removido!
// ⬆️ --- FIM DA ATUALIZAÇÃO --- ⬆️

export const ScheduleViewPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ⬇️ --- ATUALIZAÇÃO 2: Criar estado para a lista de ministérios --- ⬇️
  const [ministryList, setMinistryList] = useState<string[]>(['Todos']); // Começa com 'Todos'

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');

  // Função para carregar os dados
  const loadSchedules = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await api.get('/schedules/all');
      const data: ScheduleData[] = response.data;
      
      setSchedules(data);
      setFilteredSchedules(data);

      // ⬇️ --- ATUALIZAÇÃO 3: Popular a lista de ministérios a partir dos dados --- ⬇️
      // 1. Cria um Set (lista de itens únicos) com os nomes dos ministérios
      const uniqueMinistries = new Set(data.map(schedule => schedule.ministry));
      // 2. Converte de volta para um array, ordena, e adiciona "Todos" no início
      const sortedList = ['Todos', ...Array.from(uniqueMinistries).sort()];
      setMinistryList(sortedList);
      // ⬆️ --- FIM DA ATUALIZAÇÃO --- ⬆️

    } catch (error) {
      console.error("Erro ao buscar todas as escalas:", error);
      setApiError("Não foi possível carregar as escalas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  // Lógica de filtro (sem alteração)
  useEffect(() => {
    let filtered = schedules;

    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.volunteer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.ministry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMinistry !== 'Todos') {
      filtered = filtered.filter(schedule => schedule.ministry === selectedMinistry);
    }

    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(schedule => schedule.status === selectedStatus);
    }

    setFilteredSchedules(filtered);
  }, [searchTerm, selectedMinistry, selectedStatus, schedules]);

  // Funções de ajuda (sem alteração)
  const getStatusColor = (status: ScheduleData['status']) => {
    switch (status) {
      case 'confirmed': return theme.colors.success[500];
      case 'pending': return theme.colors.warning[500];
      case 'exchange_requested': return theme.colors.danger[500];
      default: return theme.colors.gray[500];
    }
  };
  const getStatusIcon = (status: ScheduleData['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <AlertCircle size={16} />;
      case 'exchange_requested': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };
  const getStatusLabel = (status: ScheduleData['status']) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'exchange_requested': return 'Troca Solicitada';
      default: return 'Desconhecido';
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header (sem alteração) */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
            Visualização de Escalas
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: '1.125rem' }}>
            Acompanhe em tempo real o status de todas as escalas da paróquia.
          </p>
        </div>

        {/* Filtros */}
        <div style={{ backgroundColor: theme.colors.white, padding: '1.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, marginBottom: '2rem', boxShadow: theme.shadows.sm }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                <Search size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Buscar
              </label>
              <input type="text" placeholder="Voluntário, celebração ou ministério..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem' }}/>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                <Users size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Ministério
              </label>
              {/* ⬇️ --- ATUALIZAÇÃO 4: Dropdown agora usa 'ministryList' --- ⬇️ */}
              <select value={selectedMinistry} onChange={(e) => setSelectedMinistry(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', backgroundColor: theme.colors.white }}>
                {ministryList.map(ministry => (<option key={ministry} value={ministry}>{ministry}</option>))}
              </select>
              {/* ⬆️ --- FIM DA ATUALIZAÇÃO --- ⬆️ */}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                <Filter size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Status
              </label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', backgroundColor: theme.colors.white }}>
                <option value="todos">Todos</option>
                <option value="confirmed">Confirmados</option>
                <option value="pending">Pendentes</option>
                <option value="exchange_requested">Trocas Solicitadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela (sem alteração) */}
        <div style={{ backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.gray[50] }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: theme.colors.text.primary }}>
              Todas as Escalas ({isLoading ? '...' : filteredSchedules.length})
            </h3>
          </div>
          
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.text.secondary }}>
              <Loader size={48} style={{ margin: '0 auto 1rem', animation: 'spin 1.5s linear infinite' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>A carregar escalas...</h3>
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
          ) : filteredSchedules.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.text.secondary }}>
              <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>
                {schedules.length === 0 ? 'Nenhuma escala cadastrada no sistema' : 'Nenhuma escala encontrada com estes filtros'}
              </h3>
              <p>
                {schedules.length === 0 ? 'Assim que as escalas forem criadas, aparecerão aqui.' : 'Tente ajustar os filtros de busca.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.colors.gray[50] }}>
                    <th style={{ padding: '1rem', fontWeight: '600', color: theme.colors.text.primary }}>Data / Horário</th>
                    <th style={{ padding: '1rem', fontWeight: '600', color: theme.colors.text.primary }}>Celebração</th>
                    <th style={{ padding: '1rem', fontWeight: '600', color: theme.colors.text.primary }}>Ministério</th>
                    <th style={{ padding: '1rem', fontWeight: '600', color: theme.colors.text.primary }}>Voluntário</th>
                    <th style={{ padding: '1rem', fontWeight: '600', color: theme.colors.text.primary, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => (
                    <tr key={schedule.id} style={{ backgroundColor: index % 2 === 0 ? theme.colors.white : theme.colors.gray[50], borderTop: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '1rem' }}>
                        <p style={{ fontWeight: '500' }}>{formatDate(schedule.date)}</p>
                        <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>{schedule.time}</p>
                      </td>
                      <td style={{ padding: '1rem' }}>{schedule.type}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: theme.colors.primary[100], color: theme.colors.primary[700], borderRadius: theme.borderRadius.md, fontSize: '0.75rem', fontWeight: '500' }}>
                          {schedule.ministry}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{schedule.volunteer}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: theme.borderRadius.md, backgroundColor: `${getStatusColor(schedule.status)}15`, color: getStatusColor(schedule.status), fontSize: '0.75rem', fontWeight: '500' }}>
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