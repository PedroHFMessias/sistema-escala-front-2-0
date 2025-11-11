import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  X,
  Save,
  MessageCircle
} from 'lucide-react';

const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      400: '#9ca3af',
    },
    white: '#ffffff',
    border: '#e5e7eb',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    }
  },
  borderRadius: {
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  }
};

// Simulando dados de escalas
const mockSchedules = [
  {
    id: '1',
    date: '2025-06-01',
    time: '19:00',
    type: 'Missa Dominical',
    ministry: 'Coro',
    volunteers: [
      { id: '1', name: 'Maria Silva', status: 'confirmado' },
      { id: '2', name: 'João Santos', status: 'pendente' },
      { id: '3', name: 'Ana Costa', status: 'confirmado' }
    ],
    notes: 'Primeira Comunhão - preparar cantos especiais',
    createdAt: '2025-05-20T10:00:00Z'
  },
  {
    id: '2',
    date: '2025-06-01',
    time: '08:00',
    type: 'Missa Matinal',
    ministry: 'Liturgia',
    volunteers: [
      { id: '4', name: 'Pedro Oliveira', status: 'confirmado' },
      { id: '5', name: 'Carla Mendes', status: 'troca-solicitada' }
    ],
    notes: '',
    createdAt: '2025-05-20T11:30:00Z'
  },
  {
    id: '3',
    date: '2025-06-02',
    time: '19:00',
    type: 'Missa Segunda',
    ministry: 'Acolhida',
    volunteers: [
      { id: '6', name: 'Lucas Ferreira', status: 'pendente' },
      { id: '7', name: 'Beatriz Lima', status: 'confirmado' },
      { id: '8', name: 'Roberto Cruz', status: 'confirmado' }
    ],
    notes: 'Novena de Santo Antônio',
    createdAt: '2025-05-21T09:15:00Z'
  }
];

const mockMinistries = [
  { id: '1', name: 'Coro', color: '#3b82f6' },
  { id: '2', name: 'Liturgia', color: '#f59e0b' },
  { id: '3', name: 'Acolhida', color: '#22c55e' },
  { id: '4', name: 'Eucaristia', color: '#8b5cf6' },
  { id: '5', name: 'Leitura', color: '#ef4444' }
];

const mockVolunteers = [
  { id: '1', name: 'Maria Silva', ministries: ['1', '2'] },
  { id: '2', name: 'João Santos', ministries: ['1'] },
  { id: '3', name: 'Ana Costa', ministries: ['2', '3'] },
  { id: '4', name: 'Pedro Oliveira', ministries: ['3'] },
  { id: '5', name: 'Carla Mendes', ministries: ['2'] },
  { id: '6', name: 'Lucas Ferreira', ministries: ['3', '4'] },
  { id: '7', name: 'Beatriz Lima', ministries: ['1', '4'] },
  { id: '8', name: 'Roberto Cruz', ministries: ['4', '5'] },
  { id: '9', name: 'Patricia Santos', ministries: ['1', '5'] },
  { id: '10', name: 'Ricardo Alves', ministries: ['2', '3'] }
];

const celebrationTypes = [
  'Missa Dominical',
  'Missa Matinal',
  'Missa Segunda',
  'Missa Terça',
  'Missa Quarta',
  'Missa Quinta',
  'Missa Sexta',
  'Missa Sábado',
  'Celebração Especial',
  'Adoração',
  'Via Sacra',
  'Novena'
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmado': return theme.colors.success[500];
    case 'pendente': return theme.colors.warning[500];
    case 'troca-solicitada': return theme.colors.danger[500];
    default: return theme.colors.gray[400];
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmado': return <CheckCircle size={14} />;
    case 'pendente': return <AlertCircle size={14} />;
    case 'troca-solicitada': return <XCircle size={14} />;
    default: return <AlertCircle size={14} />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
};

// Modal Component
interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: any;
  onSave: (schedule: any) => void;
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule = null,
  onSave
}) => {
  const [formData, setFormData] = useState({
    type: schedule?.type || '',
    date: schedule?.date || '',
    time: schedule?.time || '',
    ministry: schedule?.ministry || '',
    // *** MELHORIA PRINCIPAL: Popula com os voluntários existentes na escala ***
    volunteers: schedule?.volunteers || [],
    notes: schedule?.notes || ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [availableVolunteers, setAvailableVolunteers] = useState<any[]>([]);

  useEffect(() => {
    // Popula o formulário quando uma escala é passada para edição
    if (schedule) {
        setFormData({
            type: schedule.type,
            date: schedule.date,
            time: schedule.time,
            ministry: schedule.ministry,
            volunteers: schedule.volunteers,
            notes: schedule.notes
        });
    } else { // Reseta o formulário para criação
        setFormData({
            type: '', date: '', time: '', ministry: '', volunteers: [], notes: ''
        });
    }
  }, [schedule]);


  useEffect(() => {
    if (formData.ministry) {
      const ministryId = mockMinistries.find(m => m.name === formData.ministry)?.id;
      if (ministryId) {
        const filtered = mockVolunteers.filter(volunteer =>
          volunteer.ministries.includes(ministryId)
        );
        setAvailableVolunteers(filtered);
      }
    } else {
      setAvailableVolunteers([]);
    }
  }, [formData.ministry]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addVolunteer = (volunteer: any) => {
    if (!formData.volunteers.find((v: any) => v.id === volunteer.id)) {
      const newVolunteer = {
        id: volunteer.id,
        name: volunteer.name,
        status: 'pendente' // Novo voluntário sempre entra como pendente
      };
      handleInputChange('volunteers', [...formData.volunteers, newVolunteer]);
    }
  };

  // *** NOVA FUNÇÃO: Lógica para remover um voluntário da escala ***
  const removeVolunteer = (volunteerId: string) => {
    const updatedVolunteers = formData.volunteers.filter((v: any) => v.id !== volunteerId);
    handleInputChange('volunteers', updatedVolunteers);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.type) newErrors.type = 'Tipo de celebração é obrigatório';
    if (!formData.date) newErrors.date = 'Data é obrigatória';
    if (!formData.time) newErrors.time = 'Horário é obrigatório';
    if (!formData.ministry) newErrors.ministry = 'Ministério é obrigatório';
    if (formData.volunteers.length === 0) newErrors.volunteers = 'Pelo menos um voluntário deve ser selecionado';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        id: schedule?.id || Date.now().toString(),
        createdAt: schedule?.createdAt || new Date().toISOString()
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.lg, width: '100%', maxWidth: '800px',
        maxHeight: '90vh', overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem', borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: theme.colors.text.primary }}>
            {schedule ? 'Editar Escala' : 'Nova Escala'}
          </h2>
          <button onClick={onClose} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', color: theme.colors.gray[400] }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* ... (campos de Tipo, Ministério, Data, Horário - sem alterações) ... */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Celebration Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Tipo de Celebração *
              </label>
              <select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.type ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white }}>
                <option value="">Selecione o tipo</option>
                {celebrationTypes.map(type => (<option key={type} value={type}>{type}</option>))}
              </select>
              {errors.type && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.25rem' }}>{errors.type}</p>)}
            </div>
            {/* Ministry */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Ministério *
              </label>
              <select value={formData.ministry} onChange={(e) => handleInputChange('ministry', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.ministry ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white }}>
                <option value="">Selecione o ministério</option>
                {mockMinistries.map(ministry => (<option key={ministry.id} value={ministry.name}>{ministry.name}</option>))}
              </select>
              {errors.ministry && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.25rem' }}>{errors.ministry}</p>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Data *
              </label>
              <input type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.date ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white }} />
              {errors.date && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.25rem' }}>{errors.date}</p>)}
            </div>
            {/* Time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Horário *
              </label>
              <input type="time" value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.time ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white }}/>
              {errors.time && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.25rem' }}>{errors.time}</p>)}
            </div>
          </div>


          {/* Volunteers Section - *** SEÇÃO COMPLETAMENTE ATUALIZADA *** */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
              Voluntários *
            </label>

            {/* Lista de Voluntários já Selecionados */}
            <div style={{
              backgroundColor: theme.colors.gray[50],
              borderRadius: theme.borderRadius.md,
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.75rem' }}>
                Voluntários na Escala ({formData.volunteers.length})
              </h4>
              {formData.volunteers.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {formData.volunteers.map((volunteer: any) => (
                    <div key={volunteer.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                      backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.border}`, fontSize: '0.875rem'
                    }}>
                      <span>{volunteer.name}</span>
                      <button type="button" onClick={() => removeVolunteer(volunteer.id)} style={{
                          padding: '0.25rem', backgroundColor: 'transparent', border: 'none',
                          cursor: 'pointer', color: theme.colors.danger[500], borderRadius: '4px'
                        }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                 <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Nenhum voluntário selecionado.</p>
              )}
            </div>

            {/* Lista de Voluntários Disponíveis para Adicionar */}
            {formData.ministry && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.75rem' }}>
                  Adicionar Voluntários do Ministério de {formData.ministry}
                </h4>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem',
                  maxHeight: '150px', overflowY: 'auto', padding: '0.5rem',
                  border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md
                }}>
                  {availableVolunteers
                    // Filtra para não mostrar quem já está na escala
                    .filter(volunteer => !formData.volunteers.some((v: any) => v.id === volunteer.id))
                    .map(volunteer => (
                      <button key={volunteer.id} type="button" onClick={() => addVolunteer(volunteer)} style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                          backgroundColor: 'transparent', border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.borderRadius.md, cursor: 'pointer', fontSize: '0.875rem',
                          transition: 'all 0.2s', textAlign: 'left'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary[50]; e.currentTarget.style.borderColor = theme.colors.primary[500]; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = theme.colors.border; }}
                      >
                        <Plus size={14} />
                        {volunteer.name}
                      </button>
                    ))}
                     {availableVolunteers.filter(v => !formData.volunteers.some((fv:any) => fv.id === v.id)).length === 0 && (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                           Todos os voluntários deste ministério já foram adicionados.
                        </p>
                    )}
                </div>
              </div>
            )}
            {errors.volunteers && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.5rem' }}>{errors.volunteers}</p>)}
          </div>

          {/* ... (Restante do formulário e botões - sem alterações) ... */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Observações</label>
            <textarea value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Adicione observações sobre esta escala..." rows={3} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.colors.border}` }}>
            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', fontSize: '0.875rem', color: theme.colors.text.secondary }}>Cancelar</button>
            <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: theme.colors.primary[500], color: theme.colors.white, border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} />
              {schedule ? 'Atualizar Escala' : 'Criar Escala'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



// Main Component
export const ScheduleManagementPage: React.FC = () => {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'calendar'

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.volunteers.some((v: any) => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMinistry = !filterMinistry || schedule.ministry === filterMinistry;

    const matchesStatus = !filterStatus ||
                         schedule.volunteers.some((v: any) => v.status === filterStatus);

    return matchesSearch && matchesMinistry && matchesStatus;
  });

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setShowCreateModal(true);
  };

  const handleEditSchedule = (schedule: any) => {
    setSelectedSchedule(schedule);
    setShowCreateModal(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta escala?')) {
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    }
  };

  const handleSaveSchedule = (scheduleData: any) => {
    if (selectedSchedule) {
      // Edit existing schedule
      setSchedules(schedules.map(s =>
        s.id === selectedSchedule.id ? { ...s, ...scheduleData } : s
      ));
    } else {
      // Create new schedule
      setSchedules([...schedules, scheduleData]);
    }
    setShowCreateModal(false);
    setSelectedSchedule(null);
  };

  const getStatusStats = () => {
    const allVolunteers = schedules.flatMap(s => s.volunteers);
    return {
      confirmado: allVolunteers.filter((v: any) => v.status === 'confirmado').length,
      pendente: allVolunteers.filter((v: any) => v.status === 'pendente').length,
      trocaSolicitada: allVolunteers.filter((v: any) => v.status === 'troca-solicitada').length,
      total: allVolunteers.length
    };
  };

  const stats = getStatusStats();

  return (
    <div style={{ padding: '2rem', backgroundColor: theme.colors.gray[50], minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Gerenciamento de Escalas
              </h1>
              <p style={{ color: theme.colors.text.secondary }}>
                Crie e gerencie as escalas dos voluntários para as celebrações
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')} style={{ padding: '0.75rem 1rem', backgroundColor: theme.colors.gray[100], border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: theme.colors.text.primary }}>
                <Calendar size={16} />
                {viewMode === 'list' ? 'Visão Calendário' : 'Visão Lista'}
              </button>
              <button onClick={handleCreateSchedule} style={{ padding: '0.75rem 1.5rem', backgroundColor: theme.colors.primary[500], color: theme.colors.white, border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                <Plus size={16} />
                Nova Escala
              </button>
            </div>
          </div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: theme.colors.white, padding: '1.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: theme.colors.primary[50], borderRadius: '12px', color: theme.colors.primary[500] }}>
                  <Users size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary }}>{stats.total}</p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Total de Escalas</p>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: theme.colors.white, padding: '1.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: theme.colors.success[50], borderRadius: '12px', color: theme.colors.success[500] }}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary }}>{stats.confirmado}</p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Confirmados</p>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: theme.colors.white, padding: '1.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: theme.colors.warning[50], borderRadius: '12px', color: theme.colors.warning[500] }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary }}>{stats.pendente}</p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Pendentes</p>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: theme.colors.white, padding: '1.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: theme.colors.danger[50], borderRadius: '12px', color: theme.colors.danger[500] }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary }}>{stats.trocaSolicitada}</p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Trocas Solicitadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div style={{ backgroundColor: theme.colors.white, padding: '1.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, marginBottom: '1.5rem', boxShadow: theme.shadows.sm }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.gray[400] }} />
              <input type="text" placeholder="Buscar por ministério, tipo ou voluntário..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none' }} />
            </div>
            <select value={filterMinistry} onChange={(e) => setFilterMinistry(e.target.value)} style={{ padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white, minWidth: '150px' }}>
              <option value="">Todos os Ministérios</option>
              {mockMinistries.map(ministry => (<option key={ministry.id} value={ministry.name}>{ministry.name}</option>))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white, minWidth: '150px' }}>
              <option value="">Todos os Status</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente</option>
              <option value="troca-solicitada">Troca Solicitada</option>
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.75rem', backgroundColor: theme.colors.gray[100], border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', color: theme.colors.text.secondary }} title="Atualizar"><RefreshCw size={16} /></button>
              <button style={{ padding: '0.75rem', backgroundColor: theme.colors.gray[100], border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', color: theme.colors.text.secondary }} title="Exportar"><Download size={16} /></button>
            </div>
          </div>
        </div>
        {/* Schedules List */}
        <div style={{ backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm }}>
          {filteredSchedules.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.text.secondary }}>
              <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nenhuma escala encontrada</h3>
              <p>Tente ajustar os filtros ou criar uma nova escala.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px 200px 120px 100px', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: theme.colors.gray[50], borderBottom: `1px solid ${theme.colors.border}`, fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.secondary }}>
                <div>Celebração</div><div>Data</div><div>Horário</div><div>Ministério</div><div>Voluntários</div><div>Ações</div>
              </div>
              {filteredSchedules.map((schedule) => (
                <div key={schedule.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px 200px 120px 100px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.colors.border}`, alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.25rem' }}>{schedule.type}</h4>
                    <p style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Criado em {new Date(schedule.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: theme.colors.text.primary }}>{formatDate(schedule.date)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: theme.colors.text.primary }}><Clock size={14} />{schedule.time}</div>
                  <div><span style={{ padding: '0.25rem 0.75rem', backgroundColor: `${mockMinistries.find(m => m.name === schedule.ministry)?.color}20`, color: mockMinistries.find(m => m.name === schedule.ministry)?.color, borderRadius: theme.borderRadius.md, fontSize: '0.75rem', fontWeight: '500' }}>{schedule.ministry}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {schedule.volunteers.slice(0, 2).map((volunteer: any) => (
                      <div key={volunteer.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ color: getStatusColor(volunteer.status) }}>{getStatusIcon(volunteer.status)}</span>
                        <span style={{ color: theme.colors.text.secondary }}>{volunteer.name}</span>
                      </div>
                    ))}
                    {schedule.volunteers.length > 2 && (<div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>+{schedule.volunteers.length - 2} mais</div>)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setSelectedSchedule(schedule)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', color: theme.colors.primary[500] }} title="Visualizar"><Eye size={14} /></button>
                    <button onClick={() => handleEditSchedule(schedule)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', color: theme.colors.warning[500] }} title="Editar"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteSchedule(schedule.id)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', color: theme.colors.danger[500] }} title="Excluir"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Quick Actions Footer */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm }}>
          <div style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Mostrando {filteredSchedules.length} de {schedules.length} escalas</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: theme.colors.gray[100], border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', fontSize: '0.875rem', color: theme.colors.text.primary }}>Exportar Escalas</button>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: '#25D366', color: theme.colors.white, border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageCircle size={16} />Enviar Notificações</button>
          </div>
        </div>
      </div>
      {/* Modal */}
      <CreateScheduleModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        onSave={handleSaveSchedule}
      />
    </div>
  );
}
export default ScheduleManagementPage;