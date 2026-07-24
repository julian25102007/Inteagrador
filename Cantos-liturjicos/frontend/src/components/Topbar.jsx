import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const TITLES = {
  '/inicio': ['Inicio', '¡Bienvenido de nuevo!'],
  '/cantos': ['Cantos', 'Repertorio del coro'],
  '/horario': ['Horario', 'Calendario de ensayos y misas'],
  '/publicaciones': ['Publicaciones', 'Avisos del coro'],
  '/inventario': ['Inventario', 'Equipo y material'],
  '/finanzas': ['Finanzas', 'Ingresos y egresos'],
  '/coristas': ['Corista', 'Miembros del coro'],
  '/estadisticas': ['Estadísticas', 'Resumen general'],
  '/configuracion': ['Configuración', 'Tu perfil y cuenta']
};

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const base = '/' + pathname.split('/')[1];
  const [title, subtitle] = TITLES[base] || ['EVANSONG', ''];

  return (
    <header className="topbar">
      <div>
        <div className="topbar__breadcrumb">{subtitle}</div>
        <h1 className="topbar__title">{title}</h1>
      </div>
      <div className="topbar__user">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.nombreCompleto}</div>
          <div style={{ fontSize: 12, color: '#8c8272' }}>{user?.correo}</div>
        </div>
        <div className="avatar">{initials(user?.nombreCompleto)}</div>
      </div>
    </header>
  );
}
