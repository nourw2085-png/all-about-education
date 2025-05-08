
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'assistant' | 'teacher' | 'parent' | null;
export type Gender = 'male' | 'female';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender: Gender;
  points?: number;
  bankNumber?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole, gender: Gender) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateUserBankNumber?: (bankNumber: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string, role: UserRole, gender: Gender) => {
    // In a real app, this would be an API call to authenticate
    // For now we'll simulate with mock data based on role
    
    let mockUser: User;
    
    switch (role) {
      case 'student':
        mockUser = {
          id: '1',
          name: 'Student User',
          email: email,
          role: 'student',
          gender: gender,
          avatar: '/placeholder.svg'
        };
        break;
      case 'assistant':
        mockUser = {
          id: '2',
          name: 'Assistant User',
          email: email,
          role: 'assistant',
          gender: gender,
          points: 150,
          bankNumber: '',
          avatar: '/placeholder.svg'
        };
        break;
      case 'teacher':
        mockUser = {
          id: '3',
          name: 'Teacher User',
          email: email,
          role: 'teacher',
          gender: gender,
          avatar: '/placeholder.svg'
        };
        break;
      case 'parent':
        mockUser = {
          id: '4',
          name: 'Parent User',
          email: email,
          role: 'parent',
          gender: gender,
          avatar: '/placeholder.svg'
        };
        break;
      default:
        throw new Error('Invalid role');
    }
    
    // Wait for 1 second to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser(mockUser);
    setRole(role);
    
    // Store in localStorage for persistence
    localStorage.setItem('tutor-quest-user', JSON.stringify(mockUser));
  };

  const updateUserBankNumber = (bankNumber: string) => {
    if (user && user.role === 'assistant') {
      const updatedUser = {
        ...user,
        bankNumber
      };
      setUser(updatedUser);
      localStorage.setItem('tutor-quest-user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('tutor-quest-user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      isAuthenticated,
      login,
      logout,
      setRole,
      updateUserBankNumber
    }}>
      {children}
    </AuthContext.Provider>
  );
};
