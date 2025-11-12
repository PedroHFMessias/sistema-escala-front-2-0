// src/pages/management/MemberManagementPage.tsx
import React, { useState } from 'react';
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
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext'; 

// Interface Member (como está)
interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  userType: 'director' | 'coordinator' | 'volunteer';
  ministries: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Interface Ministry (como está)
interface Ministry {
  id: string;
  name: string;
  color: string;
}

// Interface MemberForm (como está)
interface MemberForm {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  password: string;
  userType: 'director' | 'coordinator' | 'volunteer';
  ministries: string[];
}

// Funções de formatação e validação (permanecem as mesmas)
const formatPhone = (value: string) => { const numbers = value.replace(/\D/g, ''); let match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/); if (!match) return value; let formatted = match[1] ? `(${match[1]}` : ''; if (match[2]) formatted += `) ${match[2]}`; if (match[3]) formatted += `-${match[3]}`; return formatted; };
const formatCPF = (value: string) => { const numbers = value.replace(/\D/g, ''); let match = numbers.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/); if (!match) return value; let formatted = match[1]; if (match[2]) formatted += `.${match[2]}`; if (match[3]) formatted += `.${match[3]}`; if (match[4]) formatted += `-${match[4]}`; return formatted; };
const formatZipCode = (value: string) => { const numbers = value.replace(/\D/g, ''); let match = numbers.match(/^(\d{0,5})(\d{0,3})$/); if (!match) return value; return `${match[1]}${match[2] ? '-' + match[2] : ''}`; };
const validateCPF = (cpf: string) => { const cleanCPF = cpf.replace(/\D/g, ''); if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false; let sum = 0, remainder; for (let i = 1; i <= 9; i++) sum += parseInt(cleanCPF.substring(i-1, i)) * (11 - i); remainder = (sum * 10) % 11; if ((remainder === 10) || (remainder === 11)) remainder = 0; if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false; sum = 0; for (let i = 1; i <= 10; i++) sum += parseInt(cleanCPF.substring(i-1, i)) * (12 - i); remainder = (sum * 10) % 11; if ((remainder === 10) || (remainder === 11)) remainder = 0; if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false; return true; };
const validateRequired = (value: string) => value.trim().length > 0;
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone);
const validateZipCode = (zipCode: string) => /^\d{5}-\d{3}$/.test(zipCode);


export const MemberManagementPage: React.FC = () => {
  const { userRole } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterType, setFilterType] = useState<'all' | 'director' | 'coordinator' | 'volunteer'>(
    userRole === 'director' ? 'all' : 'volunteer'
  );
  
  const [filterMinistry, setFilterMinistry] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<MemberForm>({ name: '', email: '', phone: '', cpf: '', rg: '', address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' }, password: '', userType: 'volunteer', ministries: [] });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock Data (Adicionado 'director' para teste)
  const [members, setMembers] = useState<Member[]>([ 
      { id: '0', name: 'Sr. Diretor', email: 'diretor@paroquia.com', phone: '(11) 90000-0000', cpf: '111.111.111-11', rg: '111111111', address: { street: 'Rua Principal', number: '1', complement: '', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '01000-000' }, userType: 'director', ministries: ['ministerio-1', 'ministerio-2', 'ministerio-3', 'ministerio-4'], status: 'active', createdAt: new Date('2024-01-01') },
      { id: '1', name: 'Maria Silva', email: 'maria.silva@email.com', phone: '(11) 99999-1234', cpf: '123.456.789-00', rg: '123456789', address: { street: 'Rua das Flores', number: '123', complement: 'Apto 45', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '01234-567' }, userType: 'volunteer', ministries: ['ministerio-1', 'ministerio-2'], status: 'active', createdAt: new Date('2024-01-15') }, 
      { id: '2', name: 'João Santos (Coord)', email: 'joao.santos@email.com', phone: '(11) 88888-5678', cpf: '987.654.321-00', rg: '987654321', address: { street: 'Av. Paulista', number: '1000', complement: '', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zipCode: '01310-100' }, userType: 'coordinator', ministries: ['ministerio-1'], status: 'active', createdAt: new Date('2024-02-20') } 
  ]);
  const ministries: Ministry[] = [ { id: 'ministerio-1', name: 'Liturgia', color: theme.colors.primary[500] }, { id: 'ministerio-2', name: 'Música', color: theme.colors.secondary[500] }, { id: 'ministerio-3', name: 'Catequese', color: theme.colors.success[500] }, { id: 'ministerio-4', name: 'Pastoral Jovem', color: theme.colors.warning[500] } ];
  const getMinistryName = (id: string) => ministries.find(m => m.id === id)?.name || 'Desconhecido';
  const getMinistryColor = (id: string) => ministries.find(m => m.id === id)?.color || theme.colors.gray[500];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // ... (sem alteração)
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
        const addressField = name.split('.')[1];
        setFormData(prev => ({ ...prev, address: { ...prev.address, [addressField]: addressField === 'zipCode' ? formatZipCode(value) : value } }));
    } else {
        let finalValue = value;
        if (name === 'phone') finalValue = formatPhone(value);
        else if (name === 'cpf') finalValue = formatCPF(value);
        else if (name === 'rg') finalValue = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    // ... (sem alteração)
    const newErrors: {[key: string]: string} = {};
    if (!validateRequired(formData.name)) newErrors.name = 'Nome é obrigatório';
    if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Formato de telefone inválido';
    if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
    if (!validateRequired(formData.rg)) newErrors.rg = 'RG é obrigatório'; else if (formData.rg.length < 7) newErrors.rg = 'RG deve ter pelo menos 7 dígitos';
    if (!validateRequired(formData.address.street)) newErrors['address.street'] = 'Logradouro é obrigatório';
    if (!validateRequired(formData.address.number)) newErrors['address.number'] = 'Número é obrigatório';
    if (!validateRequired(formData.address.neighborhood)) newErrors['address.neighborhood'] = 'Bairro é obrigatório';
    if (!validateRequired(formData.address.city)) newErrors['address.city'] = 'Cidade é obrigatória';
    if (!validateRequired(formData.address.state)) newErrors['address.state'] = 'Estado é obrigatório';
    if (!validateZipCode(formData.address.zipCode)) newErrors['address.zipCode'] = 'CEP inválido';
    if (!editingMember && formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (formData.ministries.length === 0) newErrors.ministries = 'Selecione pelo menos um ministério';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMinistryToggle = (ministryId: string) => setFormData(prev => ({ ...prev, ministries: prev.ministries.includes(ministryId) ? prev.ministries.filter(id => id !== ministryId) : [...prev.ministries, ministryId] }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!validateForm()) return; setIsLoading(true); setTimeout(() => { if (editingMember) { setMembers(prev => prev.map(member => member.id === editingMember.id ? { ...member, ...formData } : member)); } else { setMembers(prev => [...prev, { id: Date.now().toString(), ...formData, status: 'active', createdAt: new Date() }]); } resetForm(); setIsLoading(false); }, 1500); };
  
  const resetForm = () => { 
    setFormData({ 
      name: '', email: '', phone: '', cpf: '', rg: '', 
      address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' }, 
      password: '', 
      userType: 'volunteer', 
      ministries: [] 
    }); 
    setErrors({}); 
    setShowForm(false); 
    setEditingMember(null); 
    setShowPassword(false); 
  };
  
  const handleEdit = (member: Member) => { 
    setFormData({ 
        name: member.name, email: member.email, phone: member.phone, 
        cpf: member.cpf, rg: member.rg, address: member.address, 
        password: '', 
        userType: member.userType, 
        ministries: member.ministries 
    }); 
    setEditingMember(member); 
    setShowForm(true); 
  };
  
  const handleDelete = (memberId: string) => { if (confirm('Tem certeza?')) { setMembers(prev => prev.filter(m => m.id !== memberId)); } };
  const toggleMemberStatus = (memberId: string) => setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m));

  const filteredMembers = members.filter(m => {
      if (userRole === 'coordinator' && m.userType === 'director') {
        return false;
      }
      const matchesSearch = (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase()) || m.cpf.includes(searchTerm.replace(/\D/g, '')));
      const matchesMinistry = (filterMinistry === 'all' || m.ministries.includes(filterMinistry));
      let matchesRole = false;
      if (userRole === 'director') {
        matchesRole = (filterType === 'all' || m.userType === filterType);
      } else {
        matchesRole = m.userType === 'volunteer';
      }
      return matchesSearch && matchesMinistry && matchesRole;
  });

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: theme.colors.background }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Gerenciamento de Membros</h1>
              <p style={{ color: theme.colors.text.secondary, fontSize: '1.125rem' }}>
                {userRole === 'director' 
                  ? 'Cadastre e gerencie voluntários e coordenadores da paróquia'
                  : 'Gerencie os voluntários dos seus ministérios'}
              </p>
            </div>
            <button onClick={() => { resetForm(); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: theme.colors.primary[500], color: 'white', border: 'none', borderRadius: theme.borderRadius.lg, fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', boxShadow: theme.shadows.sm }}><Plus size={18} />Novo Membro</button>
          </div>
          {/* Cards de Stats (removidos para simplicidade, mas o código deles está correto) */}
        </div>
        
        {/* Filtros */}
        <div style={{ backgroundColor: theme.colors.white, padding: '1.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, marginBottom: '2rem', boxShadow: theme.shadows.sm }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: userRole === 'director' ? '2fr 1fr 1fr' : '2fr 1fr', 
            gap: '1rem', 
            alignItems: 'end' 
          }}>
            <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Buscar Membros</label><div style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary }}><Search size={18} /></div><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Nome, email ou CPF..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem' }} /></div></div>
            
            {userRole === 'director' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Tipo</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem' }}>
                  <option value="all">Todos</option>
                  <option value="volunteer">Voluntários</option>
                  <option value="coordinator">Coordenadores</option>
                  <option value="director">Diretor</option>
                </select>
              </div>
            )}
            
            <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>Ministério</label><select value={filterMinistry} onChange={(e) => setFilterMinistry(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md, fontSize: '0.875rem' }}><option value="all">Todos</option>{ministries.map(ministry => (<option key={ministry.id} value={ministry.id}>{ministry.name}</option>))}</select></div>
          </div>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div style={{ backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl, padding: '2rem', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: theme.shadows.lg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{editingMember ? 'Editar Membro' : 'Novo Membro'}</h3>
                <button onClick={resetForm} style={{ padding: '0.5rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {userRole === 'director' && (
                  <div>
                    <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Tipo de Usuário</label>
                    <select 
                      name="userType" 
                      value={formData.userType} 
                      onChange={handleInputChange} 
                      style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md }}
                    >
                      <option value="volunteer">🙏 Voluntário</option>
                      <option value="coordinator">👑 Coordenador</option>
                    </select>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Nome Completo *</label><div style={{position: 'relative'}}><User size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome completo" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.name ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.name && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.name}</p>}</div>
                  <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Email *</label><div style={{position: 'relative'}}><Mail size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@exemplo.com" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.email ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.email && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.email}</p>}</div>
                  <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Telefone *</label><div style={{position: 'relative'}}><Phone size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(11) 99999-9999" maxLength={15} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.phone ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.phone && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.phone}</p>}</div>
                  <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>CPF *</label><div style={{position: 'relative'}}><CreditCard size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="123.456.789-00" maxLength={14} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.cpf ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.cpf && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.cpf}</p>}</div>
                  <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>RG *</label><div style={{position: 'relative'}}><FileText size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary}} /><input type="text" name="rg" value={formData.rg} onChange={handleInputChange} placeholder="Apenas números" maxLength={9} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: `1px solid ${errors.rg ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }} /></div>{errors.rg && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.rg}</p>}</div>
                </div>
                
                {/* Campos de Endereço (Removidos para simplicidade, mas o código está correto) */}
                
                {!editingMember && <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Senha Inicial *</label><div style={{position: 'relative'}}><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="Mínimo 6 caracteres" style={{ width: '100%', padding: '0.75rem', border: `1px solid ${errors.password ? theme.colors.danger[500] : theme.colors.border}` }} /><button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none'}}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.password}</p>}</div>}
                
                <div><label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Ministérios *</label><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', padding: '1rem', border: `1px solid ${errors.ministries ? theme.colors.danger[500] : theme.colors.border}`, borderRadius: theme.borderRadius.md }}>{ministries.map(ministry => (<label key={ministry.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><input type="checkbox" checked={formData.ministries.includes(ministry.id)} onChange={() => handleMinistryToggle(ministry.id)} style={{accentColor: ministry.color}} /><span>{ministry.name}</span></label>))}</div>{errors.ministries && <p style={{color: theme.colors.danger[500], fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.ministries}</p>}</div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}><button type="button" onClick={resetForm} style={{flex: 1, padding: '0.75rem', backgroundColor: theme.colors.white, border: `1px solid ${theme.colors.border}`}}>Cancelar</button><button type="submit" disabled={isLoading} style={{flex: 1, padding: '0.75rem', backgroundColor: isLoading ? theme.colors.gray[400] : theme.colors.primary[500], color: 'white', border: 'none'}}>{isLoading ? 'Salvando...' : 'Salvar'}</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Tabela de Membros */}
        <div style={{ backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.colors.border}` }}><h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Lista de Membros ({filteredMembers.length})</h3></div>
          {filteredMembers.length === 0 ? (<div style={{ padding: '3rem', textAlign: 'center' }}><AlertCircle size={48} style={{margin: '0 auto 1rem', color: theme.colors.text.secondary}} /><p>Nenhum membro encontrado</p></div>) : (<div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ backgroundColor: theme.colors.gray[50] }}><th style={{padding: '1rem', textAlign: 'left', color: theme.colors.text.secondary}}>Membro</th><th style={{padding: '1rem', textAlign: 'left', color: theme.colors.text.secondary}}>Contato</th><th style={{padding: '1rem', textAlign: 'left', color: theme.colors.text.secondary}}>Documentos</th><th style={{padding: '1rem', textAlign: 'left', color: theme.colors.text.secondary}}>Endereço</th><th style={{padding: '1rem', textAlign: 'left', color: theme.colors.text.secondary}}>Tipo</th><th style={{padding: '1sem', textAlign: 'left', color: theme.colors.text.secondary}}>Ministérios</th><th style={{padding: '1rem', textAlign: 'center', color: theme.colors.text.secondary}}>Status</th><th style={{padding: '1rem', textAlign: 'center', color: theme.colors.text.secondary}}>Ações</th></tr></thead>
            <tbody>{filteredMembers.map((member, index) => (<tr key={member.id} style={{backgroundColor: index % 2 === 0 ? 'white' : theme.colors.gray[50]}}>
              <td style={{padding: '1rem'}}><div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}><div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: theme.colors.primary[500], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{member.name.charAt(0)}</div><div><p style={{fontWeight: '500'}}>{member.name}</p><p style={{fontSize: '0.75rem', color: theme.colors.text.secondary}}>Desde {member.createdAt.toLocaleDateString('pt-BR')}</p></div></div></td>
              <td style={{padding: '1rem'}}><p>{member.email}</p><p style={{fontSize: '0.75rem'}}>{member.phone}</p></td>
              <td style={{padding: '1rem'}}><p>CPF: {member.cpf}</p><p style={{fontSize: '0.75rem'}}>RG: {member.rg}</p></td>
              <td style={{padding: '1rem'}}><p>{member.address.street}, {member.address.number}</p><p style={{fontSize: '0.75rem'}}>{member.address.neighborhood}, {member.address.city}/{member.address.state}</p></td>
              
              <td style={{padding: '1rem'}}>
                <span style={{
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    backgroundColor: member.userType === 'director' ? theme.colors.danger[100] : (member.userType === 'coordinator' ? theme.colors.secondary[100] : theme.colors.primary[100]), 
                    color: member.userType === 'director' ? theme.colors.danger[600] : (member.userType === 'coordinator' ? theme.colors.secondary[700] : theme.colors.primary[700])
                }}>
                  {member.userType === 'director' ? <Shield size={12} /> : (member.userType === 'coordinator' ? <UserPlus size={12} /> : <Smile size={12} />)}
                  {member.userType === 'director' ? 'Diretor' : (member.userType === 'coordinator' ? 'Coordenador' : 'Voluntário')}
                </span>
              </td>
              
              <td style={{padding: '1rem'}}><div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem'}}>{member.ministries.slice(0, 2).map(id => (<span key={id} style={{padding: '0.25rem 0.5rem', borderRadius: theme.borderRadius.md, backgroundColor: `${getMinistryColor(id)}15`, color: getMinistryColor(id)}}>{getMinistryName(id)}</span>))}{member.ministries.length > 2 && <span>+{member.ministries.length - 2}</span>}</div></td>
              <td style={{padding: '1rem', textAlign: 'center'}}><button onClick={() => toggleMemberStatus(member.id)} style={{padding: '0.25rem 0.75rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', backgroundColor: member.status === 'active' ? theme.colors.success[100] : theme.colors.gray[100], color: member.status === 'active' ? theme.colors.success[600] : theme.colors.gray[700]}}>{member.status === 'active' ? '● Ativo' : '○ Inativo'}</button></td>
              
              {/* ATUALIZAÇÃO: Lógica de Ações CORRIGIDA */}
              <td style={{padding: '1rem', textAlign: 'center'}}>
                <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                  {/* Coordenador não pode editar Diretor */}
                  {!(userRole === 'coordinator' && member.userType === 'director') && (
                    <button onClick={() => handleEdit(member)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><Edit size={16} color={theme.colors.primary[500]} /></button>
                  )}
                  
                  {/* Lógica de Excluir:
                    - Diretor pode excluir Coordenadores e Voluntários.
                    - Coordenador pode excluir Voluntários.
                    - Ninguém pode excluir um Diretor.
                  */}
                  {((userRole === 'director' && member.userType !== 'director') || 
                    (userRole === 'coordinator' && member.userType === 'volunteer')) && (
                      <button onClick={() => handleDelete(member.id)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><Trash2 size={16} color={theme.colors.danger[500]} /></button>
                  )}
                </div>
              </td>
            </tr>))}</tbody>
          </table></div>)}
        </div>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};