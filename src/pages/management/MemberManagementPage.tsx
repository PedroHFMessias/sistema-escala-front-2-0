// src/pages/management/MemberManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  X,
  AlertCircle,
  UserPlus,
  Eye,
  EyeOff,
  CreditCard,
  FileText,
  Shield, 
  Smile, 
  Loader,
  MapPin,
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext'; 
import { api } from '../../services/api';

// Interfaces
interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// ⬇️ --- ATUALIZAÇÃO 1: 'userType' foi renomeado para 'role' --- ⬇️
interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  address: Address;
  role: 'DIRECTOR' | 'COORDINATOR' | 'VOLUNTEER'; // <-- MUDANÇA AQUI
  ministries: string[];
  ministryDetails?: { id: string, name: string, color: string }[];
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Ministry {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

// ⬇️ --- ATUALIZAÇÃO 2: 'userType' foi renomeado para 'role' --- ⬇️
interface MemberForm {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  address: Address;
  password: string;
  role: 'COORDINATOR' | 'VOLUNTEER'; // <-- MUDANÇA AQUI
  ministries: string[];
}

// Funções de formatação e validação (Sem alterações)
const formatPhone = (value: string) => { const numbers = value.replace(/\D/g, ''); let match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/); if (!match) return value; let formatted = match[1] ? `(${match[1]}` : ''; if (match[2]) formatted += `) ${match[2]}`; if (match[3]) formatted += `-${match[3]}`; return formatted; };
const formatCPF = (value: string) => { const numbers = value.replace(/\D/g, ''); let match = numbers.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/); if (!match) return value; let formatted = match[1]; if (match[2]) formatted += `.${match[2]}`; if (match[3]) formatted += `.${match[3]}`; if (match[4]) formatted += `-${match[4]}`; return formatted; };
const formatZipCode = (value: string) => { const numbers = value.replace(/\D/g, ''); let match = numbers.match(/^(\d{0,5})(\d{0,3})$/); if (!match) return value; return `${match[1]}${match[2] ? '-' + match[2] : ''}`; };
const validateCPF = (cpf: string) => { const cleanCPF = cpf.replace(/\D/g, ''); if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false; let sum = 0, remainder; for (let i = 1; i <= 9; i++) sum += parseInt(cleanCPF.substring(i-1, i)) * (11 - i); remainder = (sum * 10) % 11; if ((remainder === 10) || (remainder === 11)) remainder = 0; if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false; sum = 0; for (let i = 1; i <= 10; i++) sum += parseInt(cleanCPF.substring(i-1, i)) * (12 - i); remainder = (sum * 10) % 11; if ((remainder === 10) || (remainder === 11)) remainder = 0; if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false; return true; };
const validateRequired = (value: string) => value.trim().length > 0;
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone);
const validateZipCode = (zipCode: string) => /^\d{5}-\d{3}$/.test(zipCode);


export const MemberManagementPage: React.FC = () => {
  const { userRole } = useAuth(); // 'DIRECTOR', 'COORDINATOR'
  
  const [members, setMembers] = useState<Member[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterType, setFilterType] = useState<'all' | 'DIRECTOR' | 'COORDINATOR' | 'VOLUNTEER'>(
    userRole === 'DIRECTOR' ? 'all' : 'VOLUNTEER'
  );
  
  const [filterMinistry, setFilterMinistry] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  
  // ⬇️ --- ATUALIZAÇÃO 3: 'userType' foi renomeado para 'role' --- ⬇️
  const defaultFormState: MemberForm = {
    name: '', email: '', phone: '', cpf: '', rg: '', 
    address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' }, 
    password: '', 
    role: 'VOLUNTEER', // <-- MUDANÇA AQUI
    ministries: [] 
  };
  const [formData, setFormData] = useState<MemberForm>(defaultFormState);
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Funções de carregamento (sem alterações)
  const loadData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [membersResponse, ministriesResponse] = await Promise.all([
        api.get('/members'),
        api.get('/ministries')
      ]);
      setMembers(membersResponse.data);
      setMinistries(ministriesResponse.data.filter((m: Ministry) => m.isActive));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setApiError("Não foi possível carregar os dados. Tente recarregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMinistryName = (id: string) => ministries.find(m => m.id === id)?.name || 'Desconhecido';
  const getMinistryColor = (id: string) => ministries.find(m => m.id === id)?.color || theme.colors.gray[500];

  // Lógica de input (Sem alterações)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // ... (código existente) ...
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
        const addressField = name.split('.')[1];
        setFormData(prev => ({ 
          ...prev, 
          address: { 
            ...prev.address, 
            [addressField]: addressField === 'zipCode' ? formatZipCode(value) : value 
          } 
        }));
    } else {
        let finalValue: string | string[] = value;
        if (name === 'phone') finalValue = formatPhone(value);
        else if (name === 'cpf') finalValue = formatCPF(value);
        else if (name === 'rg') finalValue = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: finalValue as string }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError(null);
  };

  // Validação (Sem alterações)
  const validateForm = () => {
    // ... (código existente) ...
    const newErrors: {[key: string]: string} = {};
    if (!validateRequired(formData.name)) newErrors.name = 'Nome é obrigatório';
    if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Formato de telefone inválido';
    if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
    if (!validateRequired(formData.rg)) newErrors.rg = 'RG é obrigatório';
    
    if (!validateRequired(formData.address.street)) newErrors['address.street'] = 'Logradouro é obrigatório';
    if (!validateRequired(formData.address.number)) newErrors['address.number'] = 'Número é obrigatório';
    if (!validateRequired(formData.address.neighborhood)) newErrors['address.neighborhood'] = 'Bairro é obrigatório';
    if (!validateRequired(formData.address.city)) newErrors['address.city'] = 'Cidade é obrigatória';
    if (!validateRequired(formData.address.state)) newErrors['address.state'] = 'Estado é obrigatório';
    if (!validateZipCode(formData.address.zipCode)) newErrors['address.zipCode'] = 'CEP inválido';

    if (!editingMember && formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (formData.ministries.length === 0) newErrors.ministries = 'Selecione pelo menos um ministério';
    
    if (members.some(m => m.email === formData.email && m.id !== editingMember?.id)) {
      newErrors.email = 'Este email já está em uso.';
    }
    if (members.some(m => m.cpf === formData.cpf && m.id !== editingMember?.id)) {
      newErrors.cpf = 'Este CPF já está em uso.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMinistryToggle = (ministryId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      ministries: prev.ministries.includes(ministryId) 
        ? prev.ministries.filter(id => id !== ministryId) 
        : [...prev.ministries, ministryId] 
    }));
  };

  // ⬇️ --- ATUALIZAÇÃO 4: handleSubmit envia 'role' em vez de 'userType' --- ⬇️
  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!validateForm()) return; 

    setIsSubmitting(true); 
    setApiError(null);

    // O backend espera 'role', não 'userType'
    const dataToSubmit = {
      ...formData,
      userType: formData.role, // <-- MUDANÇA AQUI
    };
    
    try {
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, dataToSubmit);
      } else {
        await api.post('/members', dataToSubmit);
      }
      resetForm();
      await loadData(); 
    } catch (error: any) {
      console.error("Erro ao salvar membro:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Erro ao salvar. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => { 
    setFormData(defaultFormState); 
    setErrors({}); 
    setShowForm(false); 
    setEditingMember(null); 
    setShowPassword(false);
    setApiError(null);
  };
  
  // ⬇️ --- ATUALIZAÇÃO 5: handleEdit usa 'role' --- ⬇️
  const handleEdit = (member: Member) => { 
    setFormData({ 
        name: member.name, 
        email: member.email, 
        phone: member.phone, 
        cpf: member.cpf, 
        rg: member.rg, 
        address: member.address || defaultFormState.address, 
        password: '', 
        role: member.role === 'DIRECTOR' ? 'COORDINATOR' : member.role, // <-- MUDANÇA AQUI
        ministries: member.ministries 
    }); 
    setEditingMember(member); 
    setShowForm(true); 
  };
  
  const handleDelete = async (memberId: string) => { 
    // ... (sem alterações) ...
    if (confirm('Tem certeza que deseja excluir este membro?')) { 
      try {
        await api.delete(`/members/${memberId}`);
        setMembers(prev => prev.filter(m => m.id !== memberId));
      } catch (error: any) {
        console.error("Erro ao excluir membro:", error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(`Erro: ${error.response.data.message}`);
        } else {
          alert("Não foi possível excluir. Tente novamente.");
        }
      }
    }
  };

  const toggleMemberStatus = async (memberId: string) => {
    // ... (sem alterações) ...
    const originalMembers = [...members];
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
    ));
    try {
      await api.put(`/members/${memberId}/toggle-status`);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Não foi possível alterar o status. A lista será revertida.");
      setMembers(originalMembers);
    }
  };

  // ⬇️ --- ATUALIZAÇÃO 6: O filtro usa 'm.role' --- ⬇️
  const filteredMembers = members.filter(m => {
      if (userRole === 'COORDINATOR' && m.role === 'DIRECTOR') { // <-- MUDANÇA AQUI
        return false;
      }
      const matchesSearch = (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase()) || m.cpf.includes(searchTerm.replace(/\D/g, '')));
      const matchesMinistry = (filterMinistry === 'all' || m.ministries.includes(filterMinistry));
      
      let matchesRole = false;
      if (userRole === 'DIRECTOR') {
        matchesRole = (filterType === 'all' || m.role === filterType); // <-- MUDANÇA AQUI
      } else {
        matchesRole = m.role === 'VOLUNTEER'; // <-- MUDANÇA AQUI
      }
      return matchesSearch && matchesMinistry && matchesRole;
  });

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: theme.colors.background }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header (sem alteração) */}
        <div style={{ marginBottom: '2rem' }}>
          {/* ... */}
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Gerenciamento de Membros</h1>
              <p style={{ color: theme.colors.text.secondary, fontSize: '1.125rem' }}>
                {userRole === 'DIRECTOR' 
                  ? 'Cadastre e gerencie voluntários e coordenadores da paróquia'
                  : 'Gerencie os voluntários dos seus ministérios'}
              </p>
            </div>
            <button onClick={() => { resetForm(); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: theme.colors.primary[500], color: 'white', border: 'none', borderRadius: theme.borderRadius.lg, fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', boxShadow: theme.shadows.sm }}><Plus size={18} />Novo Membro</button>
          </div>
        </div>
        
        {/* Filtros (sem alteração) */}
        <div style={{ backgroundColor: theme.colors.white, padding: '1.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, marginBottom: '2rem', boxShadow: theme.shadows.sm }}>
          {/* ... */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: userRole === 'DIRECTOR' ? '2fr 1fr 1fr' : '2fr 1fr', 
            gap: '1rem', 
            alignItems: 'end' 
          }}>
            <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Buscar Membros</label><div style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary }}><Search size={18} /></div><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Nome, email ou CPF..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem' }} /></div></div>
            
            {userRole === 'DIRECTOR' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Tipo</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem' }}>
                  <option value="all">Todos</option>
                  <option value="VOLUNTEER">Voluntários</option>
                  <option value="COORDINATOR">Coordenadores</option>
                </select>
              </div>
            )}
            
            <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Ministério</label>
              <select value={filterMinistry} onChange={(e) => setFilterMinistry(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem' }}>
                <option value="all">Todos</option>
                {ministries.map(ministry => (<option key={ministry.id} value={ministry.id}>{ministry.name}</option>))}
              </select>
            </div>
          </div>
        </div>

        {/* --- Modal de Formulário (com 'role' em vez de 'userType') --- */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div style={{ backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl, padding: '2rem', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: theme.shadows.lg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{editingMember ? 'Editar Membro' : 'Novo Membro'}</h3>
                <button onClick={resetForm} style={{ padding: '0.5rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              
              {apiError && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: theme.colors.danger[50], color: theme.colors.danger[600], border: `1px solid ${theme.colors.danger[100]}`, borderRadius: theme.borderRadius.md, marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {apiError}
                </div>
              )}
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* ⬇️ --- ATUALIZAÇÃO 7: 'userType' renomeado para 'role' --- ⬇️ */}
                {userRole === 'DIRECTOR' && (
                  <div>
                    <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Tipo de Usuário</label>
                    <select 
                      name="role" // <-- MUDANÇA AQUI
                      value={formData.role} // <-- MUDANÇA AQUI
                      onChange={handleInputChange} 
                      style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md }}
                    >
                      <option value="VOLUNTEER">🙏 Voluntário</option>
                      <option value="COORDINATOR">👑 Coordenador</option>
                    </select>
                  </div>
                )}
                
                {/* --- CAMPOS RESTAURADOS --- */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Nome Completo *</label><div style={{position: 'relative'}}><User size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome completo" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.name ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.name && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.name}</p>}</div>
                  <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Email *</label><div style={{position: 'relative'}}><Mail size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@exemplo.com" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.email ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.email && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.email}</p>}</div>
                  <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Telefone *</label><div style={{position: 'relative'}}><Phone size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(11) 99999-9999" maxLength={15} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.phone ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.phone && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.phone}</p>}</div>
                  <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>CPF *</label><div style={{position: 'relative'}}><CreditCard size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="123.456.789-00" maxLength={14} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.cpf ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.cpf && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.cpf}</p>}</div>
                  <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>RG *</label><div style={{position: 'relative'}}><FileText size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="text" name="rg" value={formData.rg} onChange={handleInputChange} placeholder="Apenas números" maxLength={9} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.rg ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.rg && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.rg}</p>}</div>
                </div>
                
                {/* --- CAMPOS DE ENDEREÇO RESTAURADOS --- */}
                <div style={{ padding: '1.5rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.lg, backgroundColor: theme.colors.gray[50] }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={18} />
                      Endereço
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>CEP *</label>
                        <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleInputChange} placeholder="00000-000" maxLength={9} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors['address.zipCode'] ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} />
                        {errors['address.zipCode'] && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors['address.zipCode']}</p>}
                    </div>
                    <div>
                        <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Logradouro *</label>
                        <input type="text" name="address.street" value={formData.address.street} onChange={handleInputChange} placeholder="Rua, Avenida..." style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors['address.street'] ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} />
                        {errors['address.street'] && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors['address.street']}</p>}
                    </div>
                    <div>
                        <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Número *</label>
                        <input type="text" name="address.number" value={formData.address.number} onChange={handleInputChange} placeholder="123" style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors['address.number'] ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} />
                        {errors['address.number'] && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors['address.number']}</p>}
                    </div>
                    <div>
                        <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Complemento</label>
                        <input type="text" name="address.complement" value={formData.address.complement} onChange={handleInputChange} placeholder="Apto, casa, etc." style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md }} />
                    </div>
                    <div>
                        <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Bairro *</label>
                        <input type="text" name="address.neighborhood" value={formData.address.neighborhood} onChange={handleInputChange} placeholder="Seu bairro" style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors['address.neighborhood'] ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} />
                        {errors['address.neighborhood'] && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors['address.neighborhood']}</p>}
                    </div>
                    <div>
                        <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Cidade *</label>
                        <input type="text" name="address.city" value={formData.address.city} onChange={handleInputChange} placeholder="Sua cidade" style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors['address.city'] ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} />
                        {errors['address.city'] && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors['address.city']}</p>}
                    </div>
                    <div>
                        <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Estado * (UF)</label>
                        <input type="text" name="address.state" value={formData.address.state} onChange={handleInputChange} placeholder="SP" maxLength={2} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors['address.state'] ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} />
                        {errors['address.state'] && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors['address.state']}</p>}
                    </div>
                  </div>
                </div>
                
                {!editingMember && <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Senha Inicial *</label><div style={{position: 'relative'}}><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="Mínimo 6 caracteres" style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.password ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /><button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer'}}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.password}</p>}</div>}
                
                <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Ministérios *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', padding: '1rem', border: `1px solid ${errors.ministries ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md, maxHeight: '150px', overflowY: 'auto' }}>
                    {ministries.map(ministry => (
                      <label key={ministry.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                        <input type="checkbox" checked={formData.ministries.includes(ministry.id)} onChange={() => handleMinistryToggle(ministry.id)} style={{width: '16px', height: '16px', accentColor: ministry.color}} />
                        <span>{ministry.name}</span>
                      </label>
                    ))}
                    {ministries.length === 0 && <p style={{fontSize: '0.875rem', color: theme.colors.text.secondary}}>Nenhum ministério cadastrado.</p>}
                  </div>
                  {errors.ministries && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.ministries}</p>}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '1.5rem' }}>
                  <button type="button" onClick={resetForm} style={{flex: 1, padding: '0.75rem', backgroundColor: theme.colors.white, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 500}}>Cancelar</button>
                  <button type="submit" disabled={isSubmitting} style={{flex: 1, padding: '0.75rem', backgroundColor: isSubmitting ? theme.colors.gray[400] : theme.colors.primary[500], color: 'white', border: 'none', borderRadius: theme.borderRadius.md, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                    {isSubmitting && <Loader size={16} style={{ animation: 'spin 1.5s linear infinite' }} />}
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* --- FIM DO MODAL --- */}


        {/* Tabela de Membros (com 'role' em vez de 'userType') */}
        <div style={{ backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.colors.border}` }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              Lista de Membros ({isLoading ? '...' : filteredMembers.length})
            </h3>
          </div>
          
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}><Loader size={32} style={{ animation: 'spin 1.5s linear infinite' }} /></div>
          ) : apiError ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.danger[500] }}><AlertCircle size={48} style={{margin: '0 auto 1rem'}} /><p>{apiError}</p></div>
          ) : filteredMembers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <User size={48} style={{margin: '0 auto 1rem', color: theme.colors.text.secondary}} />
              <p style={{color: theme.colors.text.secondary}}>
                {searchTerm ? "Nenhum membro encontrado" : "Nenhum membro cadastrado"}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.colors.gray[50], textAlign: 'left' }}>
                    <th style={{padding: '1rem', color: theme.colors.text.secondary, fontWeight: 500}}>Membro</th>
                    <th style={{padding: '1rem', color: theme.colors.text.secondary, fontWeight: 500}}>Contato</th>
                    <th style={{padding: '1rem', color: theme.colors.text.secondary, fontWeight: 500}}>Documentos</th>
                    <th style={{padding: '1rem', color: theme.colors.text.secondary, fontWeight: 500}}>Endereço</th>
                    <th style={{padding: '1rem', color: theme.colors.text.secondary, fontWeight: 500}}>Tipo</th>
                    <th style={{padding: '1rem', color: theme.colors.text.secondary, fontWeight: 500}}>Ministérios</th>
                    <th style={{padding: '1rem', textAlign: 'center', color: theme.colors.text.secondary, fontWeight: 500}}>Status</th>
                    <th style={{padding: '1rem', textAlign: 'center', color: theme.colors.text.secondary, fontWeight: 500}}>Ações</th>
                  </tr>
                </thead>
                <tbody>{filteredMembers.map((member, index) => (
                  <tr key={member.id} style={{backgroundColor: index % 2 === 0 ? 'white' : theme.colors.gray[50], borderTop: `1px solid ${theme.colors.border}`}}>
                    {/* Coluna Membro */}
                    <td style={{padding: '1rem'}}><div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}><div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: theme.colors.primary[100], color: theme.colors.primary[600], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, textTransform: 'uppercase'}}>{member.name.charAt(0)}</div><div><p style={{fontWeight: 600, color: theme.colors.text.primary}}>{member.name}</p><p style={{fontSize: '0.75rem', color: theme.colors.text.secondary}}>Desde {new Date(member.createdAt).toLocaleDateString('pt-BR')}</p></div></div></td>
                    
                    {/* Colunas Contato, Documentos, Endereço */}
                    <td style={{padding: '1rem'}}><p style={{color: theme.colors.text.primary}}>{member.email}</p><p style={{fontSize: '0.75rem', color: theme.colors.text.secondary}}>{member.phone}</p></td>
                    <td style={{padding: '1rem'}}><p style={{color: theme.colors.text.primary}}>CPF: {member.cpf}</p><p style={{fontSize: '0.75rem', color: theme.colors.text.secondary}}>RG: {member.rg}</p></td>
                    <td style={{padding: '1rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={member.address ? `${member.address.street}, ${member.address.number}` : 'Endereço não cadastrado'}>
                      {member.address ? (
                        <>
                          <p style={{color: theme.colors.text.primary}}>{member.address.street}, {member.address.number}</p>
                          <p style={{fontSize: '0.75rem', color: theme.colors.text.secondary}}>{member.address.neighborhood}, {member.address.city}/{member.address.state}</p>
                        </>
                      ) : (
                        <p style={{color: theme.colors.text.muted, fontStyle: 'italic'}}>Sem endereço</p>
                      )}
                    </td>
                    
                    {/* ⬇️ --- ATUALIZAÇÃO 8: 'userType' renomeado para 'role' --- ⬇️ */}
                    <td style={{padding: '1rem'}}>
                      <span style={{
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: member.role === 'DIRECTOR' ? theme.colors.danger[100] : (member.role === 'COORDINATOR' ? theme.colors.secondary[100] : theme.colors.primary[100]), 
                          color: member.role === 'DIRECTOR' ? theme.colors.danger[600] : (member.role === 'COORDINATOR' ? theme.colors.secondary[700] : theme.colors.primary[700])
                      }}>
                        {member.role === 'DIRECTOR' ? <Shield size={12} /> : (member.role === 'COORDINATOR' ? <UserPlus size={12} /> : <Smile size={12} />)}
                        {member.role === 'DIRECTOR' ? 'Diretor' : (member.role === 'COORDINATOR' ? 'Coordenador' : 'Voluntário')}
                      </span>
                    </td>
                    
                    {/* Coluna Ministérios */}
                    <td style={{padding: '1rem'}}><div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem'}}>{member.ministries.slice(0, 2).map(id => (<span key={id} style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: theme.borderRadius.md, backgroundColor: `${getMinistryColor(id)}15`, color: getMinistryColor(id)}}>{getMinistryName(id)}</span>))}{member.ministries.length > 2 && <span style={{fontSize: '0.75rem', color: theme.colors.text.secondary}}>+{member.ministries.length - 2}</span>}</div></td>
                    
                    {/* Coluna Status */}
                    <td style={{padding: '1rem', textAlign: 'center'}}><button onClick={() => toggleMemberStatus(member.id)} style={{fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', backgroundColor: member.status === 'active' ? theme.colors.success[100] : theme.colors.gray[100], color: member.status === 'active' ? theme.colors.success[600] : theme.colors.gray[700], fontWeight: 500}}>{member.status === 'active' ? '● Ativo' : '○ Inativo'}</button></td>
                    
                    {/* ⬇️ --- ATUALIZAÇÃO 9: 'userType' renomeado para 'role' --- ⬇️ */}
                    <td style={{padding: '1rem', textAlign: 'center'}}>
                      <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                        {!(userRole === 'COORDINATOR' && member.role === 'DIRECTOR') && (
                          <button onClick={() => handleEdit(member)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><Edit size={16} color={theme.colors.primary[500]} /></button>
                        )}
                        
                        {((userRole === 'DIRECTOR' && member.role !== 'DIRECTOR') || 
                          (userRole === 'COORDINATOR' && member.role === 'VOLUNTEER')) && (
                            <button onClick={() => handleDelete(member.id)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><Trash2 size={16} color={theme.colors.danger[500]} /></button>
                        )}
                      </div>
                    </td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* CSS para o spin */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};