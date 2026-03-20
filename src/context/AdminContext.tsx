import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: (id: string, pw: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('aing_admin');
    if (saved === 'true') setIsAdmin(true);
  }, []);

  const login = (id: string, pw: string): boolean => {
    if (id === 'admin' && pw === 'admin') {
      setIsAdmin(true);
      sessionStorage.setItem('aing_admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('aing_admin');
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
