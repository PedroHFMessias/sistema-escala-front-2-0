// src/context/AuthContext.tsx (Frontend)
import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { api } from '../services/api'; 

type UserRole = 'DIRECTOR' | 'COORDINATOR' | 'VOLUNTEER';

// ⬇️ --- CORREÇÃO AQUI --- ⬇️
interface User {
  id: string;
  name: string;
  email: string; // <-- ADICIONADO
  role: UserRole;
}
// ⬆️ --- FIM DA CORREÇÃO --- ⬆️

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>; 
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          const response = await api.get('/auth/me'); 
          setUser(response.data);
        } catch (error) {
          console.error("Token inválido, a fazer logout:", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      localStorage.setItem('authToken', token);
      setUser(userData);
      
    } catch (error) {
      console.error("Erro no login:", error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const isAuthenticated = user !== null;

  const value: AuthContextType = {
    user,
    userRole: user?.role || null,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  if (isLoading) {
    return <div>A carregar sessão...</div>; 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};