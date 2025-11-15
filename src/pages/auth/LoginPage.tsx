// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, Info } from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { ChurchIcon } from '../../components/ui/ChurchIcon'; // Importa o ícone

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 1. Trazemos a nova função de login
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false); // 2. Estado de loading local

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({...prev, general: ''}));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 3. ATUALIZAÇÃO: handleSubmit agora chama a API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Limpa erros antigos

    try {
      // Chama a função de login do AuthContext
      await login(formData.email, formData.password);
      
      // Se o login for bem-sucedido, navega para a Home
      navigate('/'); 

    } catch (error: any) {
      // Se o login falhar (ex: 401, 404), o backend envia um erro
      console.error(error);
      // Define o erro geral vindo da nossa API
      setErrors({ general: 'Email ou senha inválidos.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem'
    }}>
      {/* (Todo o JSX/CSS de layout e branding permanece o mesmo) */}
      
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${theme.colors.primary[500]}15, ${theme.colors.secondary[500]}10)`,
        zIndex: 0
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.colors.primary[500]}20, transparent)`,
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.colors.secondary[500]}20, transparent)`,
          filter: 'blur(80px)'
        }}></div>
      </div>

      {/* Centered Login Container */}
      <div className="login-content" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4rem',
        maxWidth: '1200px',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Left Side - Branding */}
        <div className="branding-section" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div className="church-icon-container" style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: theme.colors.primary[500],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem auto',
            boxShadow: theme.shadows.lg
          }}>
            <ChurchIcon size={40} color="white" />
          </div>
          
          <h1 className="main-title" style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: theme.colors.primary[600],
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            Sistema de Escalas
          </h1>
          
          <h2 className="parish-title" style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: theme.colors.secondary[600],
            marginBottom: '1.5rem'
          }}>
            Paróquia Santana
          </h2>
          
          <p className="description" style={{
            fontSize: '1.125rem',
            color: theme.colors.text.secondary,
            lineHeight: '1.6',
            marginBottom: '2rem',
            maxWidth: '400px'
          }}>
            Gerencie as escalas da nossa comunidade de forma simples e eficiente. 
            Organize voluntários, confirme participações e mantenha tudo sob controle.
          </p>
          
          {/* Stats Container (removido para brevidade, sem alterações) */}
        </div>

        {/* Right Side - Login Form */}
        <div className="form-section" style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '400px'
        }}>
          <div className="form-container" style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius['2xl'],
            padding: '3rem',
            boxShadow: theme.shadows.lg,
            border: `1px solid ${theme.colors.border}`,
            width: '100%',
            position: 'relative'
          }}>
            {/* Form Header */}
            <div className="form-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 className="form-title" style={{
                fontSize: '1.875rem',
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Bem-vindo de volta!
              </h3>
              <p className="form-subtitle" style={{
                color: theme.colors.text.secondary,
                fontSize: '1rem'
              }}>
                Faça login para acessar o sistema
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 4. ATUALIZAÇÃO: Mensagem de erro geral da API */}
              {errors.general && (
                <p style={{ fontSize: '0.875rem', color: theme.colors.danger[500], textAlign: 'center', backgroundColor: theme.colors.danger[50], padding: '0.75rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.danger[100]}` }}>
                  {errors.general}
                </p>
              )}

              {/* Email Field */}
              <div className="field-container">
                <label className="field-label" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: theme.colors.text.primary,
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <div className="input-container" style={{ position: 'relative' }}>
                  <div className="input-icon" style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.colors.text.secondary
                  }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      border: `1px solid ${errors.email ? theme.colors.danger[500] : theme.colors.border}`,
                      borderRadius: theme.borderRadius.md,
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease-in-out',
                      backgroundColor: theme.colors.white
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary[500];
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.email ? theme.colors.danger[500] : theme.colors.border;
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="error-message" style={{
                    fontSize: '0.75rem',
                    color: theme.colors.danger[500],
                    marginTop: '0.25rem'
                  }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="field-container">
                <label className="field-label" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: theme.colors.text.primary,
                  marginBottom: '0.5rem'
                }}>
                  Senha
                </label>
                <div className="input-container" style={{ position: 'relative' }}>
                  <div className="input-icon" style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.colors.text.secondary
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Sua senha"
                    className={`form-input password-input ${errors.password ? 'input-error' : ''}`}
                    style={{
                      width: '100%',
                      padding: '0.75rem 3rem 0.75rem 3rem',
                      border: `1px solid ${errors.password ? theme.colors.danger[500] : theme.colors.border}`,
                      borderRadius: theme.borderRadius.md,
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease-in-out',
                      backgroundColor: theme.colors.white
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary[500];
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.password ? theme.colors.danger[500] : theme.colors.border;
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: theme.colors.text.secondary
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-message" style={{
                    fontSize: '0.75rem',
                    color: theme.colors.danger[500],
                    marginTop: '0.25rem'
                  }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="forgot-password" style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => console.log('Esqueceu a senha')}
                  className="forgot-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.primary[600],
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: isLoading ? theme.colors.gray[400] : theme.colors.primary[500],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = theme.colors.primary[600];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = theme.colors.primary[500];
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Entrar
                  </>
                )}
              </button>
            </form>

            {/* "Cola" de desenvolvimento para testes */}
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: theme.colors.gray[50],
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '0.8rem',
              color: theme.colors.text.secondary
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                <Info size={16} />
                <span>Dados de Teste (Reais da API)</span>
              </div>
              <p style={{ margin: '0.25rem 0' }}>Senha para todos: `password`</p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, listStylePosition: 'inside' }}>
                <li>`director@paroquia.com`</li>
                <li>(Outros que criar no backend)</li>
              </ul>
            </div>
            
          </div>
        </div>
      </div>

      {/* Loading Animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          .login-content {
            flex-direction: column !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};