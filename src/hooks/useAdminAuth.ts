import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kapl_admin_password';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedPassword = localStorage.getItem(STORAGE_KEY);
    setHasPassword(!!savedPassword);
    setIsLoaded(true);
  }, []);

  const setPassword = useCallback((password: string) => {
    localStorage.setItem(STORAGE_KEY, password);
    setHasPassword(true);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback((password: string): boolean => {
    const savedPassword = localStorage.getItem(STORAGE_KEY);
    if (savedPassword === password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    hasPassword,
    isLoaded,
    setPassword,
    login,
    logout,
  };
}
