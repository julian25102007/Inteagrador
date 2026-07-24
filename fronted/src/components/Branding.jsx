import React from 'react';
import logoUrl from '../assets/Logo.jpeg';
import heroUrl from '../assets/Imagen.jpeg';

/* =========================================================
   EVANSONG — Marca (logo e imágenes)
   Archivo único para el logo y las imágenes de la app.

   Para poner tu propio logo o imagen:
     1. Copia tu archivo (.png, .jpg o .svg) dentro de src/assets/
     2. Cambia el nombre importado arriba, por ejemplo:
          import logoUrl from '../assets/mi-logo.png';
          import heroUrl from '../assets/mi-imagen.jpg';
     3. Listo — se actualiza en todas las vistas que usan
        <Logo /> o <HeroImage /> automáticamente.
   ========================================================= */

export function Logo({ size = 40, className = '', ...rest }) {
  return (
    <img
      src={logoUrl}
      alt="Logo EVANSONG"
      width={size}
      height={size}
      className={className}
      {...rest}
    />
  );
}

export function HeroImage({ className = '', style = {}, ...rest }) {
  return (
    <img
      src={heroUrl}
      alt="Imagen de portada"
      className={className}
      style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-md)', ...style }}
      {...rest}
    />
  );
}
