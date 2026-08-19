import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser } from '../services/api';

// تعريف الأدوار المتاحة للمستخدمين في النظام
export type Role = 'student' | 'company' | 'trainer' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  isVerifying: boolean;
  role: Role;
  token: string | null;
  login: (role: Role, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // FIX: كان مخزّن بـ localStorage (يدوم حتى لو المستخدم سكّر المتصفح
  // كامل)، يعني أي شخص ثاني يفتح نفس الجهاز يورث جلسة أول واحد. sessionStorage
  // ينمسح تلقائيًا لما التاب/المتصفح يتسكر، فكل شخص يحتاج يسجّل دخول من جديد.

  // استعادة دور المستخدم من sessionStorage
  const [role, setRole] = useState<Role>(() => {
    const savedRole = sessionStorage.getItem('user_role');
    return (savedRole as Role) || null;
  });

  // استعادة التوكن من sessionStorage
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('user_token');
  });

  const login = (r: Role, t?: string) => {
    if (r) {
      sessionStorage.setItem('user_role', r);
      setRole(r);
    } else {
      sessionStorage.removeItem('user_role');
      setRole(null);
    }

    if (t) {
      sessionStorage.setItem('user_token', t);
      setToken(t);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('user_token');
    setRole(null);
    setToken(null);
  };

  // كان يثق بالتوكن المخزّن بشكل أعمى، حتى لو منتهي الصلاحية أو ملغى من
  // السيرفر — يخلي المستخدم يظهر "مسجل دخول" بالواجهة بدون داعي. نتحقق من
  // التوكن مع السيرفر (GET /auth/me) عند فتح الموقع، ونسجّل خروج تلقائي لو رفضه.
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      return;
    }

    getCurrentUser()
      .catch(() => {
        sessionStorage.removeItem('user_role');
        sessionStorage.removeItem('user_token');
        setRole(null);
        setToken(null);
      })
      .finally(() => setIsVerifying(false));
    // يشتغل مرة وحدة عند تحميل الموقع — التوكن هنا هو القيمة الأولية من
    // sessionStorage فقط، تغييره لاحقًا (login/logout) ما يعيد تشغيل التحقق
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // يعتبر مسجل دخول فقط إذا وجد Role و Token معاً، وبعد التحقق من صلاحيته
  const isAuthenticated = Boolean(role && token);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isVerifying, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
