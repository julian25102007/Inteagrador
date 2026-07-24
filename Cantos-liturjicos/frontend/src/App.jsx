import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CantosProvider } from './context/CantosContext.jsx';
import { ListasProvider } from './context/ListasContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

import Home from './pages/Home/Home.jsx';

import Cantos from './pages/Cantos/Cantos.jsx';
import CantosList from './pages/Cantos/CantosList.jsx';
import CantosListas from './pages/Cantos/CantosListas.jsx';
import ListaDetail from './pages/Cantos/ListaDetail.jsx';
import CantosEsquemas from './pages/Cantos/CantosEsquemas.jsx';
import CantoDetail from './pages/Cantos/CantoDetail.jsx';

import Horario from './pages/Horario/Horario.jsx';
import Publicaciones from './pages/Publicaciones/Publicaciones.jsx';
import Inventario from './pages/Inventario/Inventario.jsx';
import Finanzas from './pages/Finanzas/Finanzas.jsx';
import Coristas from './pages/Coristas/Coristas.jsx';
import Estadisticas from './pages/Estadisticas/Estadisticas.jsx';
import Configuracion from './pages/Configuracion/Configuracion.jsx';

// Restringe rutas exclusivas del coordinador (finanzas, inventario, coristas, estadísticas)
function CoordinadorRoute({ children }) {
  const { isCoordinador } = useAuth();
  return isCoordinador ? children : <Navigate to="/inicio" replace />;
}

function RaizSegunSesion() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? '/inicio' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Público / autenticación */}
      <Route path="/" element={<RaizSegunSesion />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* Autenticado */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/inicio" element={<Home />} />

        {/* Sección Cantos: Repertorio / Listas / Esquemas, con tabs propios */}
        <Route path="/cantos" element={<Cantos />}>
          <Route index element={<CantosList />} />
          <Route path="listas" element={<CantosListas />} />
          <Route path="esquemas" element={<CantosEsquemas />} />
        </Route>
        <Route path="/cantos/:id" element={<CantoDetail />} />
        <Route path="/cantos/listas/:id" element={<ListaDetail />} />

        <Route path="/horario" element={<Horario />} />
        <Route path="/publicaciones" element={<Publicaciones />} />
        <Route path="/configuracion" element={<Configuracion />} />

        <Route
          path="/inventario"
          element={
            <CoordinadorRoute>
              <Inventario />
            </CoordinadorRoute>
          }
        />
        <Route
          path="/finanzas"
          element={
            <CoordinadorRoute>
              <Finanzas />
            </CoordinadorRoute>
          }
        />
        <Route
          path="/coristas"
          element={
            <CoordinadorRoute>
              <Coristas />
            </CoordinadorRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <CoordinadorRoute>
              <Estadisticas />
            </CoordinadorRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CantosProvider>
        <ListasProvider>
          <AppRoutes />
        </ListasProvider>
      </CantosProvider>
    </AuthProvider>
  );
}
