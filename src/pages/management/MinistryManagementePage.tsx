import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, Calendar, Eye, EyeOff } from 'lucide-react';
import { theme } from '../../styles/theme';

interface Ministry {
  id: string;
  name: string;
  description: string;
  color: string;
  membersCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface MinistryForm {
  name: string;
  description: string;
  color: string;
}

export const MinistryManagementPage: React.FC = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([
    {
      id: '1',
      name: 'Coral',
      description: 'Ministério responsável pelos cânticos durante as celebrações',
      color: '#3b82f6',
      membersCount: 12,
      isActive: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Leitores',
      description: 'Responsáveis pelas leituras bíblicas durante as missas',
      color: '#10b981',
      membersCount: 8,
      isActive: true,
      createdAt: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Ministros Extraordinários',
      description: 'Auxílio na distribuição da Sagrada Comunhão',
      color: '#f59e0b',
      membersCount: 15,
      isActive: true,
      createdAt: new Date('2024-02-01')
    },
    {
      id: '4',
      name: 'Acólitos',
      description: 'Serviço ao altar durante as celebrações',
      color: '#8b5cf6',
      membersCount: 6,
      isActive: false,
      createdAt: new Date('2024-02-10')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [formData, setFormData] = useState<MinistryForm>({
    name: '',
    description: '',
    color: '#3b82f6'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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

  const filteredMinistries = ministries.filter(ministry =>
    ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ministry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMinistries = ministries.filter(m => m.isActive).length;
  const totalMembers = ministries.reduce((sum, m) => sum + m.membersCount, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do ministério é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    // Verificar se já existe um ministério com esse nome (exceto o que está sendo editado)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingMinistry) {
      // Editar ministério existente
      setMinistries(prev => prev.map(ministry =>
        ministry.id === editingMinistry.id
          ? { ...ministry, ...formData, name: formData.name.trim(), description: formData.description.trim() }
          : ministry
      ));
    } else {
      // Criar novo ministério
      const newMinistry: Ministry = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        membersCount: 0,
        isActive: true,
        createdAt: new Date()
      };
      setMinistries(prev => [...prev, newMinistry]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#3b82f6' });
    setEditingMinistry(null);
    setShowModal(false);
    setErrors({});
  };

  const handleEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      name: ministry.name,
      description: ministry.description,
      color: ministry.color
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    const ministry = ministries.find(m => m.id === id);
    if (ministry && ministry.membersCount > 0) {
      alert('Não é possível excluir um ministério que possui membros vinculados.');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este ministério?')) {
      setMinistries(prev => prev.filter(m => m.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setMinistries(prev => prev.map(ministry =>
      ministry.id === id
        ? { ...ministry, isActive: !ministry.isActive }
        : ministry
    ));
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
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
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary }}>
                    {ministries.length}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                    Total de Ministérios
                  </p>
                </div>
              </div>
            </div>

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
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary }}>
                    {activeMinistries}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                    Ministérios Ativos
                  </p>
                </div>
              </div>
            </div>

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
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.colors.text.primary }}>
                    {totalMembers}
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
            onClick={() => setShowModal(true)}
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

        {/* Ministry Cards */}
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
                      Desde {ministry.createdAt.toLocaleDateString('pt-BR')}
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

        {/* Empty State */}
        {filteredMinistries.length === 0 && (
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
                onClick={() => setShowModal(true)}
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
                  style={{
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
                  {editingMinistry ? 'Salvar Alterações' : 'Criar Ministério'}
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
    </div>
  );
};