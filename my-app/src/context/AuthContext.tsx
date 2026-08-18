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
  // استعادة دور المستخدم فورياً من جميع مفاتيح localStorage الممكنة
  const [role, setRole] = useState<Role>(() => {
    const savedRole = localStorage.getItem('user_role') || localStorage.getItem('role');
    if (savedRole) return savedRole.toLowerCase() as Role;

    const authUser = localStorage.getItem('auth_user') || localStorage.getItem('user');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        const r = parsed?.user?.role || parsed?.role;
        if (r) return String(r).toLowerCase() as Role;
      } catch (e) {}
    }
    return null;
  });

  // استعادة التوكن فورياً من جميع مفاتيح localStorage الممكنة
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('user_token') || localStorage.getItem('token');
    if (savedToken) return savedToken;

    const authUser = localStorage.getItem('auth_user') || localStorage.getItem('user');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        if (parsed?.token) return parsed.token;
      } catch (e) {}
    }
    return null;
  });

  const login = (r: Role, t?: string) => {
    const normalizedRole = r ? (String(r).toLowerCase() as Role) : null;

    if (normalizedRole) {
      localStorage.setItem('user_role', normalizedRole);
      localStorage.setItem('role', normalizedRole);
      setRole(normalizedRole);
    } else {
      localStorage.removeItem('user_role');
      localStorage.removeItem('role');
      setRole(null);
    }

    if (t) {
      localStorage.setItem('user_token', t);
      localStorage.setItem('token', t);
      setToken(t);
    } else {
      localStorage.removeItem('user_token');
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('role');
    localStorage.removeItem('user_token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user');
    setRole(null);
    setToken(null);
  };

  // يعتبر المستخدم مسجل دخول فورياً إذا وجد دور أو توكن حقيقي في localStorage
  const isAuthenticated = Boolean(role || token);

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