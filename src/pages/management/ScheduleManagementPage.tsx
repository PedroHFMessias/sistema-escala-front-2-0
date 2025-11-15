// src/pages/management/ScheduleManagementPage.tsx
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
  RefreshCw,
  X,
  Save,
  Loader,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import { theme } from '../../styles/theme';
import { api } from '../../services/api';

// ... (Interfaces: Volunteer, Ministry, ScheduleVolunteer, Schedule, ScheduleForm - Sem alterações) ...
interface Volunteer {
  id: string;
  name: string;
  ministries: string[];
}
interface Ministry {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}
interface ScheduleVolunteer {
  id: string;
  name: string;
  status: 'confirmado' | 'pendente' | 'troca-solicitada';
}
interface Schedule {
  id: string;
  date: string;
  time: string;
  type: string;
  ministry: string;
  ministryColor: string;
  volunteers: ScheduleVolunteer[];
  notes: string | null;
  createdAt: string;
}
interface ScheduleForm {
  type: string;
  date: string;
  time: string;
  ministryId: string;
  volunteers: string[];
  notes: string;
}

// ⬇️ --- ATUALIZAÇÃO 1: REMOÇÃO DA LISTA ESTÁTICA --- ⬇️
// const celebrationTypes = [ ... ]; // Removido!
// ⬆️ --- FIM DA ATUALIZAÇÃO --- ⬆️


// Funções de ajuda (getStatusColor, getStatusIcon, formatDate - Sem alterações)
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
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
};


// --- COMPONENTE MODAL (CreateScheduleModal) ---
interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onSave: (data: ScheduleForm, scheduleId: string | null) => Promise<void>;
  isSubmitting: boolean;
  allMinistries: Ministry[];
  allMembers: Volunteer[];
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onSave,
  isSubmitting,
  allMinistries,
  allMembers
}) => {
  
  const [formData, setFormData] = useState<ScheduleForm>({
    type: '', date: '', time: '', ministryId: '', volunteers: [], notes: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [availableVolunteers, setAvailableVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (schedule) {
        const ministry = allMinistries.find(m => m.name === schedule.ministry);
        setFormData({
          type: schedule.type,
          date: schedule.date,
          time: schedule.time,
          ministryId: ministry ? ministry.id : '',
          volunteers: schedule.volunteers.map(v => v.id),
          notes: schedule.notes || ''
        });
      } else {
        setFormData({
          type: '', date: '', time: '', ministryId: '', volunteers: [], notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, schedule, allMinistries]);

  useEffect(() => {
    if (formData.ministryId) {
      const filtered = allMembers.filter(volunteer =>
        volunteer.ministries.includes(formData.ministryId)
      );
      setAvailableVolunteers(filtered);
    } else {
      setAvailableVolunteers([]);
    }
  }, [formData.ministryId, allMembers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addVolunteer = (volunteer: Volunteer) => {
    if (!formData.volunteers.includes(volunteer.id)) {
      handleInputChange({
        target: { name: 'volunteers', value: [...formData.volunteers, volunteer.id] }
      } as any);
    }
  };

  const removeVolunteer = (volunteerId: string) => {
    handleInputChange({
      target: { name: 'volunteers', value: formData.volunteers.filter(id => id !== volunteerId) }
    } as any);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.type) newErrors.type = 'Tipo de celebração é obrigatório';
    if (!formData.date) newErrors.date = 'Data é obrigatória';
    if (!formData.time) newErrors.time = 'Horário é obrigatório';
    if (!formData.ministryId) newErrors.ministryId = 'Ministério é obrigatório';
    if (formData.volunteers.length === 0) newErrors.volunteers = 'Pelo menos um voluntário deve ser selecionado';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    await onSave(formData, schedule ? schedule.id : null);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
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
          <button onClick={onClose} disabled={isSubmitting} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', color: theme.colors.gray[400] }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            {/* ⬇️ --- ATUALIZAÇÃO 2: <select> trocado por <input> --- ⬇️ */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Tipo de Celebração *
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Ex: Missa Dominical, Batismo"
                style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.type ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white }}
              />
              {errors.type && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.25rem' }}>{errors.type}</p>)}
            </div>
            {/* ⬆️ --- FIM DA ATUALIZAÇÃO --- ⬆️ */}

            {/* Ministry */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Ministério *
              </label>
              <select name="ministryId" value={formData.ministryId} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.ministryId ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white }}>
                <option value="">Selecione o ministério</option>
                {allMinistries.map(ministry => (<option key={ministry.id} value={ministry.id}>{ministry.name}</option>))}
              </select>
              {errors.ministryId && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.25rem' }}>{errors.ministryId}</p>)}
            </div>
          </div>
          
          {/* ... (Restante do formulário: Data, Hora, Voluntários, Observações, Botões - Sem alterações) ... */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Data *
              </label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.date ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white }} />
              {errors.date && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.25rem' }}>{errors.date}</p>)}
            </div>
            {/* Time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                Horário *
              </label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.time ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white }}/>
              {errors.time && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.25rem' }}>{errors.time}</p>)}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
              Voluntários *
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Lista de Selecionados */}
              <div style={{
                flex: 1,
                backgroundColor: theme.colors.gray[50],
                borderRadius: theme.borderRadius.md,
                padding: '1rem',
                minHeight: '150px'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.75rem' }}>
                  Selecionados ({formData.volunteers.length})
                </h4>
                {formData.volunteers.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.volunteers.map((id: string) => (
                      <div key={id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                        backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md,
                        border: `1px solid ${theme.colors.border}`, fontSize: '0.875rem'
                      }}>
                        <span>{allMembers.find(v => v.id === id)?.name || '...'}</span>
                        <button type="button" onClick={() => removeVolunteer(id)} style={{
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
              
              {/* Lista de Disponíveis */}
              <div style={{
                flex: 1,
                border: `1px solid ${theme.colors.border}`, 
                borderRadius: theme.borderRadius.md,
                maxHeight: '200px', overflowY: 'auto'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.colors.border}` }}>
                  Adicionar Voluntários
                </h4>
                {!formData.ministryId ? (
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary, padding: '1rem' }}>Selecione um ministério primeiro</p>
                ) : availableVolunteers.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary, padding: '1rem' }}>Nenhum voluntário encontrado para este ministério.</p>
                ) : (
                  <div>
                    {availableVolunteers
                      .filter(volunteer => !formData.volunteers.includes(volunteer.id))
                      .map(volunteer => (
                        <button key={volunteer.id} type="button" onClick={() => addVolunteer(volunteer)} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                            backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${theme.colors.gray[100]}`,
                            cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary[50]; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <Plus size={14} />
                          {volunteer.name}
                        </button>
                    ))}
                     {availableVolunteers.filter(v => !formData.volunteers.includes(v.id)).length === 0 && (
                        <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary, padding: '1rem' }}>
                           Todos os voluntários deste ministério já foram adicionados.
                        </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {errors.volunteers && (<p style={{ fontSize: '0.75rem', color: theme.colors.danger[500], marginTop: '0.5rem' }}>{errors.volunteers}</p>)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Observações</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Adicione observações sobre esta escala..." rows={3} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}/>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.colors.border}` }}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', fontSize: '0.875rem', color: theme.colors.text.secondary }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                padding: '0.75rem 1.5rem', 
                backgroundColor: isSubmitting ? theme.colors.gray[400] : theme.colors.primary[500], 
                color: theme.colors.white, 
                border: 'none', 
                borderRadius: theme.borderRadius.md, 
                cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}
            >
              {isSubmitting && <Loader size={16} style={{ animation: 'spin 1.5s linear infinite' }} />}
              {isSubmitting 
                ? (schedule ? 'A atualizar...' : 'A criar...')
                : (<><Save size={16} /> {schedule ? 'Atualizar Escala' : 'Criar Escala'}</>)
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- FIM DO COMPONENTE MODAL ---



// --- COMPONENTE PRINCIPAL (ScheduleManagementPage) ---
// (O componente principal permanece exatamente igual à resposta anterior)
export const ScheduleManagementPage: React.FC = () => {
  const { userRole } = useAuth();
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allMinistries, setAllMinistries] = useState<Ministry[]>([]);
  const [allMembers, setAllMembers] = useState<Volunteer[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const loadData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [schedulesRes, ministriesRes, membersRes] = await Promise.all([
        api.get('/schedules/management'),
        api.get('/ministries'),
        api.get('/members')
      ]);
      
      setSchedules(schedulesRes.data);
      setAllMinistries(ministriesRes.data);
      setAllMembers(membersRes.data.map((m: any) => ({
        id: m.id,
        name: m.name,
        ministries: m.ministries
      })));

    } catch (error) {
      console.error("Erro ao carregar dados da página:", error);
      setApiError("Não foi possível carregar os dados. Tente recarregar.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = searchTerm === '' ||
                         schedule.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.volunteers.some(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMinistry = filterMinistry === 'all' || schedule.ministry === filterMinistry;
    const matchesStatus = filterStatus === 'all' ||
                         schedule.volunteers.some(v => v.status === filterStatus);
    return matchesSearch && matchesMinistry && matchesStatus;
  });

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setShowCreateModal(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowCreateModal(true);
  };

  const handleSaveSchedule = async (data: ScheduleForm, scheduleId: string | null) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      if (scheduleId) {
        await api.put(`/schedules/management/${scheduleId}`, data);
      } else {
        await api.post('/schedules/management', data);
      }
      
      await loadData();
      setShowCreateModal(false);

    } catch (error: any) {
      console.error("Erro ao salvar escala:", error);
      const message = error.response?.data?.message || "Erro desconhecido ao salvar.";
      alert(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta escala?')) {
      try {
        await api.delete(`/schedules/management/${scheduleId}`);
        setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      } catch (error: any) {
        console.error("Erro ao excluir escala:", error);
        alert(error.response?.data?.message || "Não foi possível excluir.");
      }
    }
  };

  const getStatusStats = () => {
    const allVolunteers = filteredSchedules.flatMap(s => s.volunteers);
    return {
      confirmado: allVolunteers.filter(v => v.status === 'confirmado').length,
      pendente: allVolunteers.filter(v => v.status === 'pendente').length,
      trocaSolicitada: allVolunteers.filter(v => v.status === 'troca-solicitada').length,
      total: filteredSchedules.length
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
                {userRole === 'DIRECTOR' ? 'Crie e gerencie as escalas de todos os ministérios' : 'Crie e gerencie as escalas dos seus ministérios'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary, height: '28px' }}>{isLoading ? <Loader size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : stats.total}</p>
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
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary, height: '28px' }}>{isLoading ? <Loader size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : stats.confirmado}</p>
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
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary, height: '28px' }}>{isLoading ? <Loader size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : stats.pendente}</p>
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
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary, height: '28px' }}>{isLoading ? <Loader size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : stats.trocaSolicitada}</p>
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
              <option value="all">Todos os Ministérios</option>
              {allMinistries.map(ministry => (<option key={ministry.id} value={ministry.name}>{ministry.name}</option>))}
            </select>
            
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem', outline: 'none', backgroundColor: theme.colors.white, minWidth: '150px' }}>
              <option value="all">Todos os Status</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente</option>
              <option value="troca-solicitada">Troca Solicitada</option>
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={loadData} style={{ padding: '0.75rem', backgroundColor: theme.colors.gray[100], border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', color: theme.colors.text.secondary }} title="Atualizar"><RefreshCw size={16} /></button>
              
            </div>
          </div>
        </div>
        
        {/* Schedules List */}
        <div style={{ backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm }}>
          
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}><Loader size={32} style={{ animation: 'spin 1.5s linear infinite' }} /></div>
          ) : apiError ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.danger[500] }}><AlertCircle size={48} style={{margin: '0 auto 1rem'}} /><p>{apiError}</p></div>
          ) : filteredSchedules.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.text.secondary }}>
              <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nenhuma escala encontrada</h3>
              <p>{searchTerm || filterMinistry !== 'all' || filterStatus !== 'all' ? 'Tente ajustar os filtros.' : 'Crie uma nova escala para começar.'}</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px 200px 200px 100px', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: theme.colors.gray[50], borderBottom: `1px solid ${theme.colors.border}`, fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.secondary }}>
                <div>Celebração</div><div>Data</div><div>Horário</div><div>Ministério</div><div>Voluntários</div><div>Ações</div>
              </div>
              {filteredSchedules.map((schedule) => (
                <div key={schedule.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px 200px 200px 100px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.colors.border}`, alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.25rem' }}>{schedule.type}</h4>
                    <p style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Criado em {new Date(schedule.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: theme.colors.text.primary }}>{formatDate(schedule.date)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: theme.colors.text.primary }}><Clock size={14} />{schedule.time}</div>
                  <div><span style={{ padding: '0.25rem 0.75rem', backgroundColor: `${schedule.ministryColor}20`, color: schedule.ministryColor, borderRadius: theme.borderRadius.md, fontSize: '0.75rem', fontWeight: '500' }}>{schedule.ministry}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {schedule.volunteers.slice(0, 2).map((volunteer) => (
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
      </div>
      
      <CreateScheduleModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        onSave={handleSaveSchedule}
        isSubmitting={isSubmitting} // <-- Passado para o modal
        allMinistries={allMinistries.filter(m => m.isActive)}
        allMembers={allMembers}
      />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
export default ScheduleManagementPage;