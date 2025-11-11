// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, Info } from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';

// Ícone de igreja personalizado
const ChurchIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="4" width="6" height="16" stroke={color} strokeWidth="1.5" fill="none"/>
    <rect x="5" y="8" width="4" height="12" stroke={color} strokeWidth="1.5" fill="none"/>
    <rect x="15" y="8" width="4" height="12" stroke={color} strokeWidth="1.5" fill="none"/>
    <line x1="12" y1="2" x2="12" y2="6" stroke={color} strokeWidth="1.5"/>
    <line x1="10" y1="3" x2="14" y2="3" stroke={color} strokeWidth="1.5"/>
    <rect x="10.5" y="15" width="3" height="5" stroke={color} strokeWidth="1.5" fill="none"/>
    <rect x="11" y="10" width="2" height="2" stroke={color} strokeWidth="1" fill="none"/>
    <circle cx="12" cy="7" r="1" stroke={color} strokeWidth="1" fill="none"/>
    <rect x="6" y="12" width="1.5" height="2" stroke={color} strokeWidth="1" fill="none"/>
    <rect x="16.5" y="12" width="1.5" height="2" stroke={color} strokeWidth="1" fill="none"/>
    <line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth="1.5"/>
  </svg>
);


export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simula chamada de API
    setTimeout(() => {
      setIsLoading(false);
      
      // Lógica de MOCK LOGIN atualizada
      if (formData.email === 'director@paroquia.com' && formData.password === 'password') {
        login('director'); 
        navigate('/'); 
      } else if (formData.email === 'coordinator@paroquia.com' && formData.password === 'password') {
        login('coordinator'); 
        navigate('/');
      } else if (formData.email === 'volunteer@paroquia.com' && formData.password === 'password') {
        login('volunteer'); 
        navigate('/'); 
      } else {
        setErrors({ general: 'Email ou senha inválidos' }); // Erro geral
      }
    }, 1500);
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
      <div style={{
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
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
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
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: theme.colors.primary[600],
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            Sistema de Escalas
          </h1>
          
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: theme.colors.secondary[600],
            marginBottom: '1.5rem'
          }}>
            Paróquia Santana
          </h2>
          
          <p style={{
            fontSize: '1.125rem',
            color: theme.colors.text.secondary,
            lineHeight: '1.6',
            marginBottom: '2rem',
            maxWidth: '400px'
          }}>
            Gerencie as escalas da nossa comunidade de forma simples e eficiente. 
            Organize voluntários, confirme participações e mantenha tudo sob controle.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            fontSize: '0.875rem',
            color: theme.colors.text.secondary
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: theme.colors.primary[600]
              }}>
                50+
              </div>
              <div>Voluntários</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: theme.colors.secondary[600]
              }}>
                15
              </div>
              <div>Ministérios</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: theme.colors.success[600]
              }}>
                100%
              </div>
              <div>Organizado</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius['2xl'],
            padding: '3rem',
            boxShadow: theme.shadows.lg,
            border: `1px solid ${theme.colors.border}`,
            width: '100%',
            position: 'relative'
          }}>
            {/* Form Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.875rem',
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: '0.5rem'
              }}>
                Bem-vindo de volta!
              </h3>
              <p style={{
                color: theme.colors.text.secondary,
                fontSize: '1rem'
              }}>
                Faça login para acessar o sistema
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Mensagem de erro geral */}
              {errors.general && (
                <p style={{ fontSize: '0.875rem', color: theme.colors.danger[500], textAlign: 'center' }}>
                  {errors.general}
                </p>
              )}

              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: theme.colors.text.primary,
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
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
                  <p style={{
                    fontSize: '0.75rem',
                    color: theme.colors.danger[500],
                    marginTop: '0.25rem'
                  }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: theme.colors.text.primary,
                  marginBottom: '0.5rem'
                }}>
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
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
                  <p style={{
                    fontSize: '0.75rem',
                    color: theme.colors.danger[500],
                    marginTop: '0.25rem'
                  }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => console.log('Esqueceu a senha')}
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
                    <div style={{
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

            {/* ATUALIZAÇÃO: Bloco "Criar Conta" REMOVIDO */}

            {/* "Cola" de desenvolvimento para testes */}
            <div style={{
              marginTop: '2rem', // Margem ajustada para o espaço
              padding: '1rem',
              backgroundColor: theme.colors.gray[50],
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '0.8rem',
              color: theme.colors.text.secondary
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                <Info size={16} />
                <span>Dados de Teste (TCC)</span>
              </div>
              <p style={{ margin: '0.25rem 0' }}>Senha para todos: `password`</p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, listStylePosition: 'inside' }}>
                <li>`director@paroquia.com`</li>
                <li>`coordinator@paroquia.com`</li>
                <li>`volunteer@paroquia.com`</li>
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
          .login-container {
            flex-direction: column !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};