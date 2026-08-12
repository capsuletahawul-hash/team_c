import React, { createContext, useContext, useState, ReactNode } from 'react';

// تعريف الأدوار المتاحة للمستخدمين في النظام
export type Role = 'student' | 'company' | 'trainer' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  token: string | null;
  login: (role: Role, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // استعادة دور المستخدم من localStorage
  const [role, setRole] = useState<Role>(() => {
    const savedRole = localStorage.getItem('user_role');
    return (savedRole as Role) || null;
  });

  // استعادة التوكن من الـ localStorage
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('user_token');
  });

  const login = (r: Role, t?: string) => {
    if (r) {
      localStorage.setItem('user_role', r);
      setRole(r);
    } else {
      localStorage.removeItem('user_role');
      setRole(null);
    }

    if (t) {
      localStorage.setItem('user_token', t);
      setToken(t);
    }
  };

  const logout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_token');
    setRole(null);
    setToken(null);
  };

  // ✅ التعديل الأهم: يعتبر مسجل دخول فقط إذا وجد Role و Token معاً
  const isAuthenticated = Boolean(role && token);

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};