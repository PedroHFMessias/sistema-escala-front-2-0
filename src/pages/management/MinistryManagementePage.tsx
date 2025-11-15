// src/pages/management/MinistryManagementePage.tsx

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Calendar, Eye, EyeOff, Loader, AlertTriangle } from 'lucide-react';
import { theme } from '../../styles/theme';
import { api } from '../../services/api';

// Interface do Ministério
interface Ministry {
  id: string;
  name: string;
  description: string;
  color: string;
  membersCount: number;
  isActive: boolean;
  createdAt: string; // Datas vêm como strings ISO da API
}

// Interface do Formulário
interface MinistryForm {
  name: string;
  description: string;
  color: string;
}

export const MinistryManagementPage: React.FC = () => {
  // Estados principais
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de UI (Modal, Formulário)
  const [showModal, setShowModal] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [formData, setFormData] = useState<MinistryForm>({
    name: '',
    description: '',
    color: '#3b82f6'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Estados de Feedback (Loading e Erro)
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Cores predefinidas para os ministérios
  const predefinedColors = [
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#f59e0b', // Amarelo/Dourado
    '#8b5cf6', // Roxo
    '#ef4444', // Vermelho
    '#06b6d4', // Ciano
    '#84cc16', // Verde limão
    '#f97316', // Laranja
    '#ec4899', // Rosa
    '#6b7280'  // Cinza
  ];

  // Função para carregar os ministérios da API
  const loadMinistries = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await api.get('/ministries');
      setMinistries(response.data);
    } catch (error) {
      console.error("Erro ao buscar ministérios:", error);
      setApiError("Não foi possível carregar os ministérios. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar os dados quando o componente montar
  useEffect(() => {
    loadMinistries();
  }, []); // O array vazio [] garante que isto só executa uma vez

  // Lógica de filtro
  const filteredMinistries = ministries.filter(ministry =>
    ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ministry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de stats (agora baseia-se em dados reais)
  const activeMinistries = ministries.filter(m => m.isActive).length;
  const totalMembers = ministries.reduce((sum, m) => sum + m.membersCount, 0);

  // Lógica de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  // Lógica de validação
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = 'Nome do ministério é obrigatório';
    else if (formData.name.trim().length < 2) newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    else if (formData.description.trim().length < 10) newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    
    const existingMinistry = ministries.find(m => 
      m.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      m.id !== editingMinistry?.id
    );
    if (existingMinistry) {
      newErrors.name = 'Já existe um ministério com esse nome';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de submit (chama a API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    const dataToSubmit = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
    };

    try {
      if (editingMinistry) {
        await api.put(`/ministries/${editingMinistry.id}`, dataToSubmit);
      } else {
        await api.post('/ministries', dataToSubmit);
      }
      
      resetForm();
      await loadMinistries(); // Recarrega a lista do backend

    } catch (error: any) {
      console.error("Erro ao salvar ministério:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Erro ao salvar. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função de reset
  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#3b82f6' });
    setEditingMinistry(null);
    setShowModal(false);
    setErrors({});
    setApiError(null);
  };

  // Função de edição
  const handleEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      name: ministry.name,
      description: ministry.description,
      color: ministry.color
    });
    setShowModal(true);
  };

  // Função de delete (chama a API)
  const handleDelete = async (id: string) => {
    const ministry = ministries.find(m => m.id === id);
    if (ministry && ministry.membersCount > 0) {
      alert('Não é possível excluir um ministério que possui membros vinculados.');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este ministério?')) {
      try {
        await api.delete(`/ministries/${id}`);
        setMinistries(prev => prev.filter(m => m.id !== id));
      } catch (error: any) {
        console.error("Erro ao excluir ministério:", error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(`Erro: ${error.response.data.message}`);
        } else {
          alert("Não foi possível excluir. Tente novamente.");
        }
      }
    }
  };

  // Função de toggle (chama a API)
  const toggleStatus = async (id: string) => {
    // Salva o estado original para reverter em caso de erro
    const originalMinistries = [...ministries];
    
    // Atualização otimista (muda na UI primeiro)
    setMinistries(prev => prev.map(ministry =>
      ministry.id === id
        ? { ...ministry, isActive: !ministry.isActive }
        : ministry
    ));

    try {
      await api.put(`/ministries/${id}/toggle-status`);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Não foi possível alterar o status. A lista será revertida.");
      // Reverte a alteração otimista em caso de falha
      setMinistries(originalMinistries);
    }
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: theme.colors.background }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '600', 
            color: theme.colors.text.primary,
            marginBottom: '0.5rem'
          }}>
            Gerenciamento de Ministérios
          </h1>
          <p style={{ 
            color: theme.colors.text.secondary,
            marginBottom: '2rem'
          }}>
            Cadastre e gerencie os ministérios da paróquia
          </p>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {/* Card Total */}
            <div style={{
              backgroundColor: theme.colors.white,
              padding: '1.5rem',
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.sm
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  backgroundColor: theme.colors.primary[100],
                  color: theme.colors.primary[600]
                }}>
                  <Users size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary, height: '28px' }}>
                    {isLoading ? <Loader size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : ministries.length}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                    Total de Ministérios
                  </p>
                </div>
              </div>
            </div>

            {/* Card Ativos */}
            <div style={{
              backgroundColor: theme.colors.white,
              padding: '1.5rem',
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.sm
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  backgroundColor: theme.colors.success[100],
                  color: theme.colors.success[600]
                }}>
                  <Eye size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary, height: '28px' }}>
                    {isLoading ? <Loader size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : activeMinistries}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                    Ministérios Ativos
                  </p>
                </div>
              </div>
            </div>

            {/* Card Membros */}
            <div style={{
              backgroundColor: theme.colors.white,
              padding: '1.5rem',
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.sm
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  backgroundColor: theme.colors.secondary[100],
                  color: theme.colors.secondary[600]
                }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary, height: '28px' }}>
                    {isLoading ? <Loader size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : totalMembers}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                    Total de Membros
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <div style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.colors.text.secondary
            }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar ministérios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: `1px solid ${theme.colors.border}`,
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
                e.target.style.borderColor = theme.colors.border;
              }}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: theme.colors.primary[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[600];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[500];
            }}
          >
            <Plus size={18} />
            Novo Ministério
          </button>
        </div>

        {/* Container principal com Loading e Erro */}
        
        {/* Caso 1: Loading Inicial */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: theme.colors.text.secondary }}>
            <Loader size={48} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 1rem' }} />
            <p>A carregar ministérios...</p>
          </div>
        )}

        {/* Caso 2: Erro Inicial */}
        {!isLoading && apiError && filteredMinistries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: theme.colors.danger[50], color: theme.colors.danger[600], borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.danger[100]}` }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Erro ao Carregar</h3>
            <p>{apiError}</p>
            <button 
              onClick={loadMinistries}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: theme.colors.danger[500],
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer'
              }}
            >
              Recarregar
            </button>
          </div>
        )}

        {/* Caso 3: Sucesso, mas lista vazia (Empty State) */}
        {!isLoading && !apiError && filteredMinistries.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: theme.colors.gray[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Users size={32} color={theme.colors.gray[400]} />
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: theme.colors.text.primary,
              marginBottom: '0.5rem'
            }}>
              {searchTerm ? 'Nenhum ministério encontrado' : 'Nenhum ministério cadastrado'}
            </h3>
            <p style={{
              color: theme.colors.text.secondary,
              marginBottom: '1.5rem'
            }}>
              {searchTerm 
                ? 'Tente ajustar os termos da busca'
                : 'Comece criando o primeiro ministério da paróquia'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: theme.colors.primary[500],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease-in-out'
                }}
              >
                <Plus size={18} />
                Criar Primeiro Ministério
              </button>
            )}
          </div>
        )}

        {/* Caso 4: Sucesso, com dados (Ministry Cards) */}
        {!isLoading && filteredMinistries.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredMinistries.map((ministry) => (
              <div
                key={ministry.id}
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: theme.shadows.sm,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  opacity: ministry.isActive ? 1 : 0.7
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
                {/* Color Header */}
                <div style={{
                  height: '4px',
                  backgroundColor: ministry.color
                }}></div>

                {/* Card Content */}
                <div style={{ padding: '1.5rem' }}>
                  {/* Header with Status */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                        marginBottom: '0.5rem'
                      }}>
                        {ministry.name}
                      </h3>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: theme.borderRadius.full,
                        backgroundColor: ministry.isActive ? theme.colors.success[100] : theme.colors.gray[100],
                        color: ministry.isActive ? theme.colors.success[500] : theme.colors.gray[700],
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {ministry.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {ministry.isActive ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: theme.colors.text.secondary,
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem'
                  }}>
                    {ministry.description}
                  </p>

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    padding: '0.75rem',
                    backgroundColor: theme.colors.gray[50],
                    borderRadius: theme.borderRadius.md
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color={theme.colors.text.secondary} />
                      <span style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                        {ministry.membersCount} membros
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color={theme.colors.text.secondary} />
                      <span style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                        Desde {new Date(ministry.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem'
                  }}>
                    <button
                      onClick={() => toggleStatus(ministry.id)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: ministry.isActive ? theme.colors.warning[100] : theme.colors.success[100],
                        color: ministry.isActive ? theme.colors.warning[500] : theme.colors.success[500],
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {ministry.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      {ministry.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(ministry)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: theme.colors.primary[100],
                        color: theme.colors.primary[700],
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.primary[200];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.primary[100];
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(ministry.id)}
                      disabled={ministry.membersCount > 0}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: ministry.membersCount > 0 ? theme.colors.gray[100] : theme.colors.danger[100],
                        color: ministry.membersCount > 0 ? theme.colors.gray[400] : theme.colors.danger[500],
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        cursor: ministry.membersCount > 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        if (ministry.membersCount === 0) {
                          e.currentTarget.style.backgroundColor = theme.colors.danger[200];
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (ministry.membersCount === 0) {
                          e.currentTarget.style.backgroundColor = theme.colors.danger[100];
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: theme.shadows.lg
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: theme.colors.text.primary,
              marginBottom: '1.5rem'
            }}>
              {editingMinistry ? 'Editar Ministério' : 'Novo Ministério'}
            </h2>

            {/* Exibir erro da API no modal */}
            {apiError && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: theme.colors.danger[50],
                color: theme.colors.danger[600],
                border: `1px solid ${theme.colors.danger[100]}`,
                borderRadius: theme.borderRadius.md,
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Nome */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: theme.colors.text.primary,
                  marginBottom: '0.5rem'
                }}>
                  Nome do Ministério
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Coral, Leitores, Ministros..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${errors.name ? theme.colors.danger[500] : theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary[500];
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? theme.colors.danger[500] : theme.colors.border;
                  }}
                />
                {errors.name && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: theme.colors.danger[500],
                    marginTop: '0.25rem'
                  }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: theme.colors.text.primary,
                  marginBottom: '0.5rem'
                }}>
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva as responsabilidades e atividades deste ministério..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${errors.description ? theme.colors.danger[500] : theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary[500];
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.description ? theme.colors.danger[500] : theme.colors.border;
                  }}
                />
                {errors.description && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: theme.colors.danger[500],
                    marginTop: '0.25rem'
                  }}>
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Cor */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: theme.colors.text.primary,
                  marginBottom: '0.5rem'
                }}>
                  Cor do Ministério
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '0.75rem'
                }}>
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: formData.color === color ? `3px solid ${theme.colors.text.primary}` : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: formData.color === color ? theme.shadows.md : theme.shadows.sm
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                marginTop: '1rem'
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: theme.colors.text.secondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.gray[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
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
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSubmitting && <Loader size={16} style={{ animation: 'spin 1.5s linear infinite' }} />}
                  {isSubmitting 
                    ? (editingMinistry ? 'A salvar...' : 'A criar...')
                    : (editingMinistry ? 'Salvar Alterações' : 'Criar Ministério')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overlay para fechar modal clicando fora */}
      {showModal && (
        <div
          onClick={resetForm}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}

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