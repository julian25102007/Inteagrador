import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Cantos.css';

export default function Cantos() {
  return (
    <div>
      <div className="cantos-tabs">
        <NavLink
          to="/cantos"
          end
          className={({ isActive }) => 'cantos-tab' + (isActive ? ' is-active' : '')}
        >
          Repertorio
        </NavLink>
        <NavLink
          to="/cantos/listas"
          className={({ isActive }) => 'cantos-tab' + (isActive ? ' is-active' : '')}
        >
          Listas
        </NavLink>
        <NavLink
          to="/cantos/esquemas"
          className={({ isActive }) => 'cantos-tab' + (isActive ? ' is-active' : '')}
        >
          Esquemas
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
