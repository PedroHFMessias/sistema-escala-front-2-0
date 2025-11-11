/**
 * Utilitários para formatação de campos
 */
export const formatters = {
  /**
   * Formatar telefone no padrão (11) 99999-9999
   */
  phone: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      const match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted += `(${match[1]}`;
        if (match[1] && match[1].length === 2) formatted += ') ';
        if (match[2]) formatted += match[2];
        if (match[3]) formatted += `-${match[3]}`;
        return formatted;
      }
    }
    return value;
  },

  /**
   * Formatar CPF no padrão 123.456.789-00
   */
  cpf: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      const match = numbers.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
      if (match) {
        let formatted = match[1];
        if (match[2]) formatted += `.${match[2]}`;
        if (match[3]) formatted += `.${match[3]}`;
        if (match[4]) formatted += `-${match[4]}`;
        return formatted;
      }
    }
    return value;
  },

  /**
   * Formatar RG no padrão 12.345.678-9
   */
  rg: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 9) {
      const match = numbers.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,1})$/);
      if (match) {
        let formatted = match[1];
        if (match[2]) formatted += `.${match[2]}`;
        if (match[3]) formatted += `.${match[3]}`;
        if (match[4]) formatted += `-${match[4]}`;
        return formatted;
      }
    }
    return value;
  },

  /**
   * Formatar CEP no padrão 12345-678
   */
  zipCode: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      const match = numbers.match(/^(\d{0,5})(\d{0,3})$/);
      if (match) {
        let formatted = match[1];
        if (match[2]) formatted += `-${match[2]}`;
        return formatted;
      }
    }
    return value;
  }
};

/**
 * Utilitários para validação de campos
 */
export const validators = {
  /**
   * Validar email
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validar telefone brasileiro
   */
  phone: (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validar CPF brasileiro
   */
  cpf: (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  },

  /**
   * Validar RG brasileiro (mínimo 8 dígitos)
   */
  rg: (rg: string): boolean => {
    const cleanRG = rg.replace(/\D/g, '');
    return cleanRG.length >= 8 && cleanRG.length <= 9;
  },

  /**
   * Validar CEP brasileiro
   */
  zipCode: (zipCode: string): boolean => {
    const zipCodeRegex = /^\d{5}-\d{3}$/;
    return zipCodeRegex.test(zipCode);
  },

  /**
   * Validar se string não está vazia
   */
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Validar tamanho mínimo
   */
  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },

  /**
   * Validar senha forte
   */
  strongPassword: (password: string): boolean => {
    // Pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }
};

/**
 * Mensagens de erro padrão
 */
export const errorMessages = {
  required: 'Este campo é obrigatório',
  email: 'Email inválido',
  phone: 'Formato: (11) 99999-9999',
  cpf: 'CPF inválido',
  rg: 'RG deve ter pelo menos 8 dígitos',
  zipCode: 'Formato: 12345-678',
  minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  strongPassword: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número'
};

/**
 * Função para validar formulário de membro
 */
export const validateMemberForm = (data: any, isEditing: boolean = false) => {
  const errors: { [key: string]: string } = {};

  // Nome
  if (!validators.required(data.name)) {
    errors.name = errorMessages.required;
  } else if (!validators.minLength(data.name, 2)) {
    errors.name = errorMessages.minLength(2);
  }

  // Email
  if (!validators.required(data.email)) {
    errors.email = errorMessages.required;
  } else if (!validators.email(data.email)) {
    errors.email = errorMessages.email;
  }

  // Telefone
  if (!validators.required(data.phone)) {
    errors.phone = errorMessages.required;
  } else if (!validators.phone(data.phone)) {
    errors.phone = errorMessages.phone;
  }

  // CPF
  if (!validators.required(data.cpf)) {
    errors.cpf = errorMessages.required;
  } else if (!validators.cpf(data.cpf)) {
    errors.cpf = errorMessages.cpf;
  }

  // RG
  if (!validators.required(data.rg)) {
    errors.rg = errorMessages.required;
  } else if (!validators.rg(data.rg)) {
    errors.rg = errorMessages.rg;
  }

  // Endereço
  if (!validators.required(data.address?.street || '')) {
    errors['address.street'] = errorMessages.required;
  }

  if (!validators.required(data.address?.number || '')) {
    errors['address.number'] = errorMessages.required;
  }

  if (!validators.required(data.address?.neighborhood || '')) {
    errors['address.neighborhood'] = errorMessages.required;
  }

  if (!validators.required(data.address?.city || '')) {
    errors['address.city'] = errorMessages.required;
  }

  if (!validators.required(data.address?.state || '')) {
    errors['address.state'] = errorMessages.required;
  }

  if (!validators.required(data.address?.zipCode || '')) {
    errors['address.zipCode'] = errorMessages.required;
  } else if (!validators.zipCode(data.address.zipCode)) {
    errors['address.zipCode'] = errorMessages.zipCode;
  }

  // Senha (apenas para novos usuários)
  if (!isEditing) {
    if (!validators.required(data.password)) {
      errors.password = errorMessages.required;
    } else if (!validators.minLength(data.password, 6)) {
      errors.password = errorMessages.minLength(6);
    }
  }

  // Ministérios
  if (!data.ministries || data.ministries.length === 0) {
    errors.ministries = 'Selecione pelo menos um ministério';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Função para limpar apenas números de uma string
 */
export const extractNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Função para capitalizar primeira letra de cada palavra
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Função para validar se CPF já existe (simulação)
 */
export const checkCPFExists = async (cpf: string, _excludeId?: string): Promise<boolean> => {
  // Simulação de verificação - em produção seria uma chamada à API
  // O parâmetro excludeId seria usado para excluir o próprio registro durante edição
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: alguns CPFs já existem
      const existingCPFs = ['123.456.789-00', '987.654.321-00'];
      const exists = existingCPFs.includes(cpf);
      resolve(exists);
    }, 500);
  });
};

/**
 * Função para validar se email já existe (simulação)
 */
export const checkEmailExists = async (email: string, _excludeId?: string): Promise<boolean> => {
  // Simulação de verificação - em produção seria uma chamada à API
  // O parâmetro excludeId seria usado para excluir o próprio registro durante edição
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: alguns emails já existem
      const existingEmails = ['admin@paroquia.com', 'teste@email.com'];
      const exists = existingEmails.includes(email.toLowerCase());
      resolve(exists);
    }, 500);
  });
};

/**
 * Função para buscar endereço por CEP (simulação)
 */
export const fetchAddressByCEP = async (cep: string): Promise<any> => {
  // Simulação de busca por CEP - em produção usaria ViaCEP ou similar
  const cleanCEP = extractNumbers(cep);
  
  if (cleanCEP.length !== 8) {
    throw new Error('CEP inválido');
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock de alguns CEPs conhecidos
      const mockAddresses: { [key: string]: any } = {
        '01310100': {
          street: 'Avenida Paulista',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP'
        },
        '20040020': {
          street: 'Rua da Assembleia',
          neighborhood: 'Centro',
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        '30112000': {
          street: 'Rua da Bahia',
          neighborhood: 'Centro',
          city: 'Belo Horizonte',
          state: 'MG'
        }
      };

      const address = mockAddresses[cleanCEP];
      if (address) {
        resolve(address);
      } else {
        // Para CEPs não mockados, retorna dados genéricos
        resolve({
          street: '',
          neighborhood: '',
          city: '',
          state: ''
        });
      }
    }, 1000);
  });
};

/**
 * Estados brasileiros para validação
 */
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
];

/**
 * Função para validar estado brasileiro
 */
export const validateBrazilianState = (state: string): boolean => {
  const stateCodes = BRAZILIAN_STATES.map(s => s.code);
  return stateCodes.includes(state.toUpperCase());
};

/**
 * Função para gerar senha temporária
 */
export const generateTemporaryPassword = (): string => {
  const length = 8;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  
  // Garantir pelo menos uma maiúscula, uma minúscula e um número
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  
  // Completar com caracteres aleatórios
  for (let i = 3; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Função para mascarar dados sensíveis para exibição
 */
export const maskSensitiveData = {
  cpf: (cpf: string): string => {
    const cleanCPF = extractNumbers(cpf);
    if (cleanCPF.length === 11) {
      return `${cleanCPF.substring(0, 3)}.***.**${cleanCPF.substring(9)}`;
    }
    return cpf;
  },
  
  rg: (rg: string): string => {
    const cleanRG = extractNumbers(rg);
    if (cleanRG.length >= 8) {
      return `**.***.**${cleanRG.slice(-1)}`;
    }
    return rg;
  },
  
  email: (email: string): string => {
    const [local, domain] = email.split('@');
    if (local && domain) {
      const maskedLocal = local.length > 3 
        ? `${local.substring(0, 2)}***${local.slice(-1)}`
        : `${local[0]}***`;
      return `${maskedLocal}@${domain}`;
    }
    return email;
  },
  
  phone: (phone: string): string => {
    const numbers = extractNumbers(phone);
    if (numbers.length === 11) {
      return `(${numbers.substring(0, 2)}) *****-${numbers.substring(7)}`;
    }
    return phone;
  }
};