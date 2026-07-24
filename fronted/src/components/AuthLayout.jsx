import React from 'react';
import { Logo } from './Branding.jsx';

/* Layout de dos columnas para Login/Registro:
   izquierda = logo sobre fondo claro, derecha = formulario. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth-split">
      <div className="auth-split__side">
        <Logo size={140} />
        <div className="auth-split__brand">EVANSONG</div>
      </div>
      <div className="auth-split__main">{children}</div>
    </div>
  );
}
