import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'student' | 'assistant' | 'teacher' | 'parent' | null;
export type Gender = 'male' | 'female';

export const AVAILABLE_PAPERS = [
  'O Level Edexcel',
  'O Level CIS',
  'Pure 1',
  'Pure 2',
  'Pure 3',
  'Pure 4',
  'M1',
  'S1',
  'M2',
] as const;

export type Paper = typeof AVAILABLE_PAPERS[number];

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
  studentCodes?: string[];
  papers?: Paper[];
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole, gender?: Gender) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    gender: Gender,
    bankNumber?: string,
    studentCode?: string,
    studentCodes?: string[],
    papers?: Paper[],
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  updateUserBankNumber?: (bankNumber: string) => Promise<void>;
  updateUserAvatar: (avatar: string) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Dark mode (kept from previous impl)
  useEffect(() => {
    const stored = localStorage.getItem('tutor-quest-dark-mode');
    if (stored) setIsDarkMode(stored === 'true');
    else setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    // restore role-selection (used by landing page → login flow)
    const r = localStorage.getItem('tutor-quest-selected-role') as UserRole;
    if (r) setRoleState(r);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('tutor-quest-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  const fetchProfile = useCallback(async (userId: string, fallbackEmail: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const userRole = (roles?.[0]?.role ?? null) as UserRole;

    if (!profile) {
      setUser({
        id: userId,
        name: fallbackEmail.split('@')[0],
        email: fallbackEmail,
        role: userRole,
        gender: 'male',
      });
    } else {
      setUser({
        id: userId,
        name: profile.name,
        email: profile.email,
        role: userRole,
        gender: profile.gender as Gender,
        points: profile.points ?? 0,
        bankNumber: profile.bank_number ?? undefined,
        avatar: profile.avatar_url ?? '/placeholder.svg',
        studentCode: profile.student_code ?? undefined,
        studentCodes: profile.linked_student_codes ?? [],
        papers: (profile.papers ?? []) as Paper[],
      });
    }
    setRoleState(userRole);
  }, []);

  // Auth state listener — set up BEFORE getSession
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Defer DB call to avoid deadlock inside the callback
        setTimeout(() => {
          fetchProfile(newSession.user.id, newSession.user.email ?? '');
        }, 0);
      } else {
        setUser(null);
        setRoleState(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      if (existing?.user) {
        fetchProfile(existing.user.id, existing.user.email ?? '').finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    gender: Gender,
    bankNumber?: string,
    studentCode?: string,
    studentCodes?: string[],
    papers?: Paper[],
  ) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role,
          gender,
          papers: papers ?? [],
          bank_number: bankNumber || null,
          student_code: studentCode || null,
          linked_student_codes: studentCodes ?? [],
        },
      },
    });
    if (error) throw new Error(error.message);
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin + '/dashboard',
    });
    if (result.error) throw new Error(result.error.message ?? 'Google sign-in failed');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoleState(null);
    setSession(null);
  };

  const setRole = (r: UserRole) => {
    setRoleState(r);
    if (r) localStorage.setItem('tutor-quest-selected-role', r);
    else localStorage.removeItem('tutor-quest-selected-role');
  };

  const updateUserBankNumber = async (bankNumber: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ bank_number: bankNumber }).eq('user_id', user.id);
    setUser({ ...user, bankNumber });
  };

  const updateUserAvatar = async (avatar: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ avatar_url: avatar }).eq('user_id', user.id);
    setUser({ ...user, avatar });
  };

  const toggleDarkMode = () => setIsDarkMode((v) => !v);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!session,
        loading,
        login,
        register,
        signInWithGoogle,
        logout,
        setRole,
        updateUserBankNumber,
        updateUserAvatar,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
