
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
  studentCode?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole, gender: Gender) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, gender: Gender, bankNumber?: string, studentCode?: string) => Promise<void>;
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
    
    // Check if user exists in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('tutor-quest-users') || '[]');
    const foundUser = storedUsers.find((u: User) => u.email === email && role === u.role);
    
    if (!foundUser) {
      throw new Error("User not found. Please register first.");
    }
    
    // Wait for 1 second to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser(foundUser);
    setRole(role);
    
    // Store in localStorage for persistence
    localStorage.setItem('tutor-quest-user', JSON.stringify(foundUser));
  };

  const register = async (name: string, email: string, password: string, role: UserRole, gender: Gender, bankNumber?: string, studentCode?: string) => {
    // Get existing users or initialize empty array
    const storedUsers = JSON.parse(localStorage.getItem('tutor-quest-users') || '[]');
    
    // Check if user already exists with this email and role
    const userExists = storedUsers.some((user: User) => user.email === email && user.role === role);
    if (userExists) {
      throw new Error('User with this email and role already exists');
    }
    
    // Generate a new ID (in a real app this would come from the backend)
    const id = `${role}-${Date.now()}`;
    
    // Create new user based on role
    let newUser: User;
    
    switch (role) {
      case 'student':
        newUser = {
          id,
          name,
          email,
          role: 'student',
          gender,
          studentCode: studentCode || `S-${Math.floor(Math.random() * 10000)}`,
          avatar: '/placeholder.svg'
        };
        break;
      case 'assistant':
        newUser = {
          id,
          name,
          email,
          role: 'assistant',
          gender,
          points: 0,
          bankNumber: bankNumber || '',
          avatar: '/placeholder.svg'
        };
        break;
      case 'teacher':
        newUser = {
          id,
          name,
          email,
          role: 'teacher',
          gender,
          avatar: '/placeholder.svg'
        };
        break;
      case 'parent':
        newUser = {
          id,
          name,
          email,
          role: 'parent',
          gender,
          avatar: '/placeholder.svg'
        };
        break;
      default:
        throw new Error('Invalid role');
    }
    
    // Store the password in a separate object (in a real app this would be hashed and stored securely)
    const passwordEntry = { email, role, password };
    const passwords = JSON.parse(localStorage.getItem('tutor-quest-passwords') || '[]');
    passwords.push(passwordEntry);
    localStorage.setItem('tutor-quest-passwords', JSON.stringify(passwords));
    
    // Add to users array and save to localStorage
    storedUsers.push(newUser);
    localStorage.setItem('tutor-quest-users', JSON.stringify(storedUsers));
    
    // Wait for 1 second to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log in the user automatically
    setUser(newUser);
    setRole(role);
    localStorage.setItem('tutor-quest-user', JSON.stringify(newUser));
  };

  const updateUserBankNumber = (bankNumber: string) => {
    if (user && user.role === 'assistant') {
      const updatedUser = {
        ...user,
        bankNumber
      };
      setUser(updatedUser);
      localStorage.setItem('tutor-quest-user', JSON.stringify(updatedUser));
      
      // Also update in the users array
      const storedUsers = JSON.parse(localStorage.getItem('tutor-quest-users') || '[]');
      const updatedUsers = storedUsers.map((u: User) => {
        if (u.id === user.id) {
          return updatedUser;
        }
        return u;
      });
      localStorage.setItem('tutor-quest-users', JSON.stringify(updatedUsers));
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
      register,
      logout,
      setRole,
      updateUserBankNumber
    }}>
      {children}
    </AuthContext.Provider>
  );
};
