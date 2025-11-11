// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

// ATUALIZAÇÃO 1: Definir os tipos de usuário
type UserRole = 'director' | 'coordinator' | 'volunteer';

// ATUALIZAÇÃO 2: Simplificar o Contexto para usar apenas userRole
interface AuthContextType {
  userRole: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // ATUALIZAÇÃO 3: Armazenar apenas a STRING do papel
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    // Usando localStorage para persistência (sugestão anterior)
    return localStorage.getItem('userRole') as UserRole | null;
  });

  // ATUALIZAÇÃO 4: Login recebe apenas a string 'role'
  const login = (role: UserRole) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
    console.log(`Usuário logado como: ${role}`);
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    setUserRole(null);
    console.log('Usuário deslogado');
  };

  const isAuthenticated = userRole !== null;

  const value = {
    userRole,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};