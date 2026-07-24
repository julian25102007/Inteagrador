import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Mientras se verifica si ya había una sesión guardada (token en
  // localStorage), no decidas nada todavía — si no, cada refresh de
  // página manda al login aunque la sesión sí sea válida.
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
