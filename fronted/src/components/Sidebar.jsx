import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from './Branding.jsx';
import {
  IconHome,
  IconCantos,
  IconHorario,
  IconPublicaciones,
  IconInventario,
  IconFinanzas,
  IconCoristas,
  IconEstadisticas,
  IconConfiguracion,
  IconLogout,
  IconMenu
} from './Icons.jsx';

// Enlaces visibles para todos los roles
const BASE_LINKS = [
  { to: '/inicio', label: 'Inicio', Icon: IconHome },
  { to: '/cantos', label: 'Cantos', Icon: IconCantos },
  { to: '/horario', label: 'Horario', Icon: IconHorario },
  { to: '/publicaciones', label: 'Publicaciones', Icon: IconPublicaciones }
];

// Enlaces adicionales exclusivos del Coordinador
const COORDINADOR_LINKS = [
  { to: '/inventario', label: 'Inventario', Icon: IconInventario },
  { to: '/finanzas', label: 'Finanzas', Icon: IconFinanzas },
  { to: '/coristas', label: 'Corista', Icon: IconCoristas },
  { to: '/estadisticas', label: 'Estadísticas', Icon: IconEstadisticas }
];

const SETTINGS_LINK = { to: '/configuracion', label: 'Configuración', Icon: IconConfiguracion };

export default function Sidebar({ collapsed, onToggle }) {
  const { isCoordinador, logout } = useAuth();

  const links = isCoordinador ? [...BASE_LINKS, ...COORDINADOR_LINKS] : BASE_LINKS;

  return (
    <aside className={'sidebar' + (collapsed ? ' sidebar--collapsed' : '')}>
      <div className="sidebar__brand">
        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          aria-expanded={!collapsed}
        >
          <IconMenu size={20} />
        </button>
        <Logo size={30} />
        <span className="sidebar__brand-mark">EVANSONG</span>
      </div>
      <div className="sidebar__brand-sub" style={{ padding: '0 8px 20px' }}>
        {isCoordinador ? 'Coordinador' : 'Corista'}
      </div>

      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 'sidebar__link' + (isActive ? ' is-active' : '')}
          >
            <span className="sidebar__icon">
              <link.Icon size={18} />
            </span>
            <span className="label">{link.label}</span>
          </NavLink>
        ))}
        <NavLink
          to={SETTINGS_LINK.to}
          className={({ isActive }) => 'sidebar__link' + (isActive ? ' is-active' : '')}
        >
          <span className="sidebar__icon">
            <SETTINGS_LINK.Icon size={18} />
          </span>
          <span className="label">{SETTINGS_LINK.label}</span>
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={logout}>
          <span className="sidebar__icon">
            <IconLogout size={18} />
          </span>
          <span className="label">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
