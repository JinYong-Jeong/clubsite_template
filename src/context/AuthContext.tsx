import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthUser {
  id: string;
  name: string;
  role: 'admin' | 'ops' | 'member' | 'ob';
  member_id: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('aing_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem('aing_user');
      }
    }
  }, []);

  const login = async (name: string, password: string): Promise<boolean> => {
    // 1. users 테이블 확인
    try {
      // v11: bcrypt 해싱 검증 (check_user_password RPC)
      const { data: rpcData } = await supabase.rpc('check_user_password', {
        p_name: name.trim(),
        p_password: password,
      });
      const userData = rpcData && rpcData.length > 0 ? rpcData[0] : null;

      if (userData) {
        const u: AuthUser = {
          id: userData.id,
          name: userData.name,
          role: userData.role as 'admin' | 'ops' | 'member' | 'ob',
          member_id: userData.member_id || null,
        };
        setUser(u);
        sessionStorage.setItem('aing_user', JSON.stringify(u));
        return true;
      }
    } catch {
      // users table may not exist yet, fall through
    }

    // 2. members 테이블에서 확인 (password_hash + track 기반 role)
    try {
      const { data: memberData } = await supabase
        .from('members')
        .select('id, name, password_hash, track')
        .ilike('name', name.trim())
        .single();

      if (memberData && memberData.password_hash === password) {
        const role: 'admin' | 'ops' | 'member' | 'ob' =
          memberData.track === 'admin' ? 'admin' :
          memberData.track === 'ob' ? 'ob' : 'member';
        const u: AuthUser = {
          id: memberData.id,
          name: memberData.name,
          role,
          member_id: memberData.id,
        };
        setUser(u);
        sessionStorage.setItem('aing_user', JSON.stringify(u));
        return true;
      }
    } catch {
      // ignore
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('aing_user');
    sessionStorage.removeItem('aing_admin');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'ops';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
