import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { theme } from '../../styles/theme';

// Interface para os dados da escala (reaproveitada da página de relatórios)
interface ScheduleData {
  id: string;
  date: string;
  time: string;
  type: string;
  ministry: string;
  volunteer: string;
  status: 'confirmado' | 'pendente' | 'troca-solicitada';
}

// Dados mockados para simular as escalas do sistema
const mockSchedulesData: ScheduleData[] = [
    { id: '1', date: '2025-06-01', time: '19:00', type: 'Missa Dominical', ministry: 'Coro', volunteer: 'Maria Silva', status: 'confirmado' },
    { id: '2', date: '2025-06-01', time: '19:00', type: 'Missa Dominical', ministry: 'Coro', volunteer: 'João Santos', status: 'pendente' },
    { id: '3', date: '2025-06-01', time: '08:00', type: 'Missa Matinal', ministry: 'Liturgia', volunteer: 'Pedro Oliveira', status: 'confirmado' },
    { id: '4', date: '2025-06-01', time: '08:00', type: 'Missa Matinal', ministry: 'Liturgia', volunteer: 'Carla Mendes', status: 'troca-solicitada' },
    { id: '5', date: '2025-06-02', time: '19:00', type: 'Missa Segunda', ministry: 'Acolhida', volunteer: 'Lucas Ferreira', status: 'pendente' },
    { id: '6', date: '2025-06-02', time: '19:00', type: 'Missa Segunda', ministry: 'Acolhida', volunteer: 'Beatriz Lima', status: 'confirmado' },
    { id: '7', date: '2025-06-03', time: '19:00', type: 'Missa Terça', ministry: 'Eucaristia', volunteer: 'Roberto Cruz', status: 'confirmado' },
    { id: '8', date: '2025-06-03', time: '19:00', type: 'Missa Terça', ministry: 'Eucaristia', volunteer: 'Ana Costa', status: 'troca-solicitada' },
    { id: '9', date: '2025-06-08', time: '19:00', type: 'Missa Dominical', ministry: 'Coro', volunteer: 'Ricardo Souza', status: 'pendente' },
    { id: '10', date: '2025-06-08', time: '19:00', type: 'Missa Dominical', ministry: 'Liturgia', volunteer: 'Fernanda Lima', status: 'confirmado' },
];

const ministries = ['Todos', 'Coro', 'Liturgia', 'Acolhida', 'Eucaristia', 'Leitura'];

export const ScheduleViewPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleData[]>(mockSchedulesData);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleData[]>(mockSchedulesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');

  useEffect(() => {
    let filtered = schedules;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.volunteer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.ministry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por ministério
    if (selectedMinistry !== 'Todos') {
      filtered = filtered.filter(schedule => schedule.ministry === selectedMinistry);
    }

    // Filtro por status
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(schedule => schedule.status === selectedStatus);
    }

    setFilteredSchedules(filtered);
  }, [searchTerm, selectedMinistry, selectedStatus, schedules]);

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
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
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
              <select value={selectedMinistry} onChange={(e) => setSelectedMinistry(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', backgroundColor: theme.colors.white }}>
                {ministries.map(ministry => (<option key={ministry} value={ministry}>{ministry}</option>))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                <Filter size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Status
              </label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', backgroundColor: theme.colors.white }}>
                <option value="todos">Todos</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendente">Pendentes</option>
                <option value="troca-solicitada">Trocas Solicitadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Escalas */}
        <div style={{ backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.gray[50] }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: theme.colors.text.primary }}>
              Todas as Escalas ({filteredSchedules.length})
            </h3>
          </div>
          {filteredSchedules.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.text.secondary }}>
              <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>Nenhuma escala encontrada</h3>
              <p>Tente ajustar os filtros de busca.</p>
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
    </div>
  );
};