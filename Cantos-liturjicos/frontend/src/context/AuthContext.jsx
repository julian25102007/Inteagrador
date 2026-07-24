import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginRequest, registroRequest, meRequest, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // 'Coordinador' | 'Corista' | null
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, si ya hay un token guardado, intenta recuperar la sesión
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    meRequest()
      .then((perfil) => {
        setUser(perfil);
        setRole(perfil.rol);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (correo, contrasena) => {
    const { usuario, token } = await loginRequest(correo, contrasena);
    setToken(token);
    setUser(usuario);
    setRole(usuario.rol);
    setIsAuthenticated(true);
    return usuario;
  }, []);

  const register = useCallback(async (datos) => {
    const { usuario, token } = await registroRequest(datos);
    setToken(token);
    setUser(usuario);
    setRole(usuario.rol);
    setIsAuthenticated(true);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  const value = {
    role,
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    isCoordinador: role === 'Coordinador'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
