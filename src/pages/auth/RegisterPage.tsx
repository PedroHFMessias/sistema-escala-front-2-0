// src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, UserPlus, CreditCard, FileText, MapPin } from 'lucide-react';
import { theme } from '../../styles/theme';
import { ChurchIcon } from '../../components/ui/ChurchIcon';
import { formatters, validators } from '../../utils/validation'; // Importando utilitários

interface RegisterForm {
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
  confirmPassword: string;
  userType: 'coordinator'; // Fixo para coordenador nesta página
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    password: '',
    confirmPassword: '',
    userType: 'coordinator'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Aplica formatação usando os utilitários
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatters.phone(value) }));
    } else if (name === 'cpf') {
      setFormData(prev => ({ ...prev, [name]: formatters.cpf(value) }));
    } else if (name === 'rg') {
      setFormData(prev => ({ ...prev, [name]: formatters.rg(value) }));
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      const val = addressField === 'zipCode' ? formatters.zipCode(value) : value;
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: val }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    const { name, email, phone, cpf, rg, address, password, confirmPassword } = formData;

    if (!validators.required(name)) newErrors.name = 'Nome é obrigatório';
    if (!validators.email(email)) newErrors.email = 'Email inválido';
    if (!validators.phone(phone)) newErrors.phone = 'Telefone inválido';
    if (!validators.cpf(cpf)) newErrors.cpf = 'CPF inválido';
    if (!validators.rg(rg)) newErrors.rg = 'RG inválido';
    if (!validators.required(address.zipCode)) newErrors['address.zipCode'] = 'CEP é obrigatório';
    if (!validators.required(address.street)) newErrors['address.street'] = 'Logradouro é obrigatório';
    if (!validators.required(address.number)) newErrors['address.number'] = 'Número é obrigatório';
    if (!validators.required(address.neighborhood)) newErrors['address.neighborhood'] = 'Bairro é obrigatório';
    if (!validators.required(address.city)) newErrors['address.city'] = 'Cidade é obrigatória';
    if (!validators.required(address.state)) newErrors['address.state'] = 'Estado é obrigatório';
    if (!password || password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Cadastro de Coordenador realizado:', formData);
      alert(`Cadastro de Coordenador realizado com sucesso para: ${formData.name}`);
      navigate('/login');
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      padding: '2rem 0'
    }}>
      <div style={{
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius['2xl'],
        padding: '2rem 3rem',
        boxShadow: theme.shadows.lg,
        border: `1px solid ${theme.colors.border}`,
        width: '100%',
        maxWidth: '800px', // Aumentado para comportar mais campos
        position: 'relative'
      }}>
        {/* Form Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <ChurchIcon size={40} color={theme.colors.primary[500]} />
            <h3 style={{
            fontSize: '1.875rem',
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginTop: '1rem',
            marginBottom: '0.5rem'
            }}>
            Cadastro de Coordenador
            </h3>
            <p style={{ color: theme.colors.text.secondary, fontSize: '1rem' }}>
            Preencha os dados para criar uma conta de coordenador.
            </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Dados Pessoais */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Nome Completo</label>
              <div className="input-container">
                  <User size={18} className="input-icon" />
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Seu nome completo" className={`form-input ${errors.name ? 'input-error' : ''}`} />
              </div>
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="field-label">Email</label>
              <div className="input-container">
                  <Mail size={18} className="input-icon" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" className={`form-input ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            {/* Phone */}
            <div>
              <label className="field-label">Telefone</label>
              <div className="input-container">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(11) 99999-9999" maxLength={15} className={`form-input ${errors.phone ? 'input-error' : ''}`} />
              </div>
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>
             {/* CPF */}
             <div>
              <label className="field-label">CPF</label>
              <div className="input-container">
                  <CreditCard size={18} className="input-icon" />
                  <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" maxLength={14} className={`form-input ${errors.cpf ? 'input-error' : ''}`} />
              </div>
              {errors.cpf && <p className="error-message">{errors.cpf}</p>}
            </div>
            {/* RG */}
            <div>
              <label className="field-label">RG</label>
              <div className="input-container">
                  <FileText size={18} className="input-icon" />
                  <input type="text" name="rg" value={formData.rg} onChange={handleInputChange} placeholder="00.000.000-0" maxLength={12} className={`form-input ${errors.rg ? 'input-error' : ''}`} />
              </div>
              {errors.rg && <p className="error-message">{errors.rg}</p>}
            </div>
          </div>

           {/* Endereço */}
           <div style={{ padding: '1.5rem', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.lg, backgroundColor: theme.colors.gray[50] }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} />
                    Endereço
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* CEP e Logradouro */}
                    <div>
                        <label className="field-label">CEP</label>
                        <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleInputChange} placeholder="00000-000" maxLength={9} className={`form-input ${errors['address.zipCode'] ? 'input-error' : ''}`} />
                        {errors['address.zipCode'] && <p className="error-message">{errors['address.zipCode']}</p>}
                    </div>
                    <div>
                        <label className="field-label">Logradouro</label>
                        <input type="text" name="address.street" value={formData.address.street} onChange={handleInputChange} placeholder="Rua, Avenida..." className={`form-input ${errors['address.street'] ? 'input-error' : ''}`} />
                        {errors['address.street'] && <p className="error-message">{errors['address.street']}</p>}
                    </div>
                    {/* Número e Complemento */}
                    <div>
                        <label className="field-label">Número</label>
                        <input type="text" name="address.number" value={formData.address.number} onChange={handleInputChange} placeholder="123" className={`form-input ${errors['address.number'] ? 'input-error' : ''}`} />
                        {errors['address.number'] && <p className="error-message">{errors['address.number']}</p>}
                    </div>
                     <div>
                        <label className="field-label">Complemento</label>
                        <input type="text" name="address.complement" value={formData.address.complement} onChange={handleInputChange} placeholder="Apto, casa, etc." className="form-input" />
                    </div>
                    {/* Bairro, Cidade, Estado */}
                    <div>
                        <label className="field-label">Bairro</label>
                        <input type="text" name="address.neighborhood" value={formData.address.neighborhood} onChange={handleInputChange} placeholder="Seu bairro" className={`form-input ${errors['address.neighborhood'] ? 'input-error' : ''}`} />
                        {errors['address.neighborhood'] && <p className="error-message">{errors['address.neighborhood']}</p>}
                    </div>
                    <div>
                        <label className="field-label">Cidade</label>
                        <input type="text" name="address.city" value={formData.address.city} onChange={handleInputChange} placeholder="Sua cidade" className={`form-input ${errors['address.city'] ? 'input-error' : ''}`} />
                        {errors['address.city'] && <p className="error-message">{errors['address.city']}</p>}
                    </div>
                    <div>
                        <label className="field-label">Estado</label>
                        <input type="text" name="address.state" value={formData.address.state} onChange={handleInputChange} placeholder="UF" maxLength={2} className={`form-input ${errors['address.state'] ? 'input-error' : ''}`} />
                        {errors['address.state'] && <p className="error-message">{errors['address.state']}</p>}
                    </div>
                </div>
           </div>

          {/* Senha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                  <label className="field-label">Senha</label>
                  <div className="input-container">
                      <Lock size={18} className="input-icon" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="Mínimo 6 caracteres" className={`form-input password-input ${errors.password ? 'input-error' : ''}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                  </div>
                  {errors.password && <p className="error-message">{errors.password}</p>}
              </div>
              <div>
                  <label className="field-label">Confirmar Senha</label>
                  <div className="input-container">
                      <Lock size={18} className="input-icon" />
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repita sua senha" className={`form-input password-input ${errors.confirmPassword ? 'input-error' : ''}`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle">
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                  </div>
                  {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
              </div>
          </div>
          
          {/* Submit Button */}
          <button type="submit" disabled={isLoading} className={`submit-button ${isLoading ? 'loading' : ''}`}>
            {isLoading ? <div className="spinner"></div> : <UserPlus size={18} />}
            <span>{isLoading ? 'Criando conta...' : 'Criar Conta de Coordenador'}</span>
          </button>
        </form>

         {/* Login Link */}
         <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => navigate('/login')} className="register-link">
                  <ArrowLeft size={16} style={{ marginRight: '0.25rem' }}/>
                  Já tenho uma conta. Fazer login
              </button>
          </div>
      </div>
      <style>{`
        .field-label { display: block; font-size: 0.875rem; font-weight: 500; color: ${theme.colors.text.primary}; margin-bottom: 0.5rem; }
        .input-container { position: relative; }
        .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: ${theme.colors.text.secondary}; }
        .form-input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid ${theme.colors.border}; border-radius: 0.375rem; font-size: 1rem; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: ${theme.colors.primary[500]}; }
        .form-input.input-error { border-color: ${theme.colors.danger[500]}; }
        .password-input { padding-right: 3rem; }
        .password-toggle { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); border: none; background: none; cursor: pointer; color: ${theme.colors.text.secondary}; }
        .error-message { font-size: 0.75rem; color: ${theme.colors.danger[500]}; margin-top: 0.25rem; }
        .submit-button { width: 100%; padding: 0.875rem; background-color: ${theme.colors.primary[500]}; color: white; border: none; border-radius: 0.375rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .submit-button:hover:not(.loading) { background-color: ${theme.colors.primary[600]}; }
        .submit-button.loading { background-color: ${theme.colors.gray[400]}; cursor: not-allowed; }
        .register-link { background: none; border: none; color: ${theme.colors.primary[600]}; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: underline; display: inline-flex; align-items: center; }
        .spinner { width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};