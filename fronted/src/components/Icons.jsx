import React from 'react';
function Base({ size = 20, color, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      {...rest}
    >
      {children}
    </svg>
  );
}

/* Base especial para iconos basados en relleno (Fill) */
function BaseFill({ size = 20, color, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconMenu({ color = 'currentColor', ...p }) {
  return (
    <Base color={color} {...p}>
      <path d="M3.5 6.5h17" />
      <path d="M3.5 12h17" />
      <path d="M3.5 17.5h17" />
    </Base>
  );
}

/* --- Navegación principal (Estilo Filled / Relleno) --- */

// IconHome (Material Symbols Rounded)
export function IconHome({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19" />
    </BaseFill>
  );
}

// IconCantos (TDesign Music Filled)
export function IconCantos({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="M20 2.913V18a3 3 0 1 1-2-2.83V8.088L8 8.92V19a3 3 0 1 1-2-2.83V4.08z" />
    </BaseFill>
  );
}

// IconHorario (Unicons Calendar Solid)
export function IconHorario({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="M2 19c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-8H2zM19 4h-2V3c0-.6-.4-1-1-1s-1 .4-1 1v1H9V3c0-.6-.4-1-1-1s-1 .4-1 1v1H5C3.3 4 2 5.3 2 7v2h20V7c0-1.7-1.3-3-3-3" />
    </BaseFill>
  );
}

// IconPublicaciones (Fluent Form 48 Filled)
export function IconPublicaciones({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} viewBox="0 0 48 48" {...p}>
      <path d="M18.5 21.5a2 2 0 1 1-4 0a2 2 0 0 1 4 0m-2 13a2 2 0 1 0 0-4a2 2 0 0 0 0 4M6 12.25A6.25 6.25 0 0 1 12.25 6h23.5A6.25 6.25 0 0 1 42 12.25v23.5A6.25 6.25 0 0 1 35.75 42h-23.5A6.25 6.25 0 0 1 6 35.75zm15 9.25a4.5 4.5 0 1 0-9 0a4.5 4.5 0 0 0 9 0M16.5 37a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9m-3.25-26a1.25 1.25 0 1 0 0 2.5h21.5a1.25 1.25 0 1 0 0-2.5zM23 21.75c0 .69.56 1.25 1.25 1.25h10.5a1.25 1.25 0 1 0 0-2.5h-10.5c-.69 0-1.25.56-1.25 1.25M24.25 31a1.25 1.25 0 1 0 0 2.5h10.5a1.25 1.25 0 1 0 0-2.5z" />
    </BaseFill>
  );
}

// IconInventario (Solar Box Bold)
export function IconInventario({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="m17.578 4.432l-2-1.05C13.822 2.461 12.944 2 12 2s-1.822.46-3.578 1.382l-.321.169l8.923 5.099l4.016-2.01c-.646-.732-1.688-1.279-3.462-2.21m4.17 3.534l-3.998 2V13a.75.75 0 0 1-1.5 0v-2.286l-3.5 1.75v9.44c.718-.179 1.535-.607 2.828-1.286l2-1.05c2.151-1.129 3.227-1.693 3.825-2.708c.597-1.014.597-2.277.597-4.8v-.117c0-1.893 0-3.076-.252-3.978M11.25 21.904v-9.44l-8.998-4.5C2 8.866 2 10.05 2 11.941v.117c0 2.525 0 3.788.597 4.802c.598 1.015 1.674 1.58 3.825 2.709l2 1.049c1.293.679 2.11 1.107 2.828 1.286M2.96 6.641l9.04 4.52l3.411-1.705l-8.886-5.078l-.103.054c-1.773.93-2.816 1.477-3.462 2.21" />
    </BaseFill>
  );
}

// IconFinanzas (Iconify Round Savings)
export function IconFinanzas({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="m19.83 7.5l-2.27-2.27c.07-.42.18-.81.32-1.15c.11-.26.15-.56.09-.87c-.13-.72-.83-1.22-1.57-1.21c-1.59.03-3 .81-3.9 2h-5C4.46 4 2 6.46 2 9.5c0 2.25 1.37 7.48 2.08 10.04c.24.86 1.03 1.46 1.93 1.46H8c1.1 0 2-.9 2-2h2c0 1.1.9 2 2 2h2.01c.88 0 1.66-.58 1.92-1.43l1.25-4.16l2.14-.72a1 1 0 0 0 .68-.95V8.5c0-.55-.45-1-1-1zM12 9H9c-.55 0-1-.45-1-1s.45-1 1-1h3c.55 0 1 .45 1 1s-.45 1-1 1m4 2c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1" />
    </BaseFill>
  );
}

// IconCoristas (Material Design Icons - People)
export function IconCoristas({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.4 3.4 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.4 3.4 0 0 0 15 11a3.5 3.5 0 0 0 0-7" />
    </BaseFill>
  );
}

// IconEstadisticas (Material Symbols Finance)
export function IconEstadisticas({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="M5 21q-.825 0-1.412-.587T3 19V4q0-.425.288-.712T4 3t.713.288T5 4v15h15q.425 0 .713.288T21 20t-.288.713T20 21zm2-3q-.425 0-.712-.288T6 17v-7q0-.425.288-.712T7 9h2q.425 0 .713.288T10 10v7q0 .425-.288.713T9 18zm5 0q-.425 0-.712-.288T11 17V5q0-.425.288-.712T12 4h2q.425 0 .713.288T15 5v12q0 .425-.288.713T14 18zm5 0q-.425 0-.712-.288T16 17v-3q0-.425.288-.712T17 13h2q.425 0 .713.288T20 14v3q0 .425-.288.713T19 18z" />
  </BaseFill>
  );
}

// IconConfiguracion (Material Symbols Settings)
export function IconConfiguracion({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5" />
    </BaseFill>
  );
}

// IconLogout (Lucide Log Out)
export function IconLogout({ color = 'currentColor', ...p }) {
  return (
    <Base color={color} {...p}>
      <path d="m16 17l5-5l-5-5m5 5H9m0 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </Base>
  );
}

/* --- Roles (Selección de perfil) --- */

// IconCoordinador (TDesign User Filled)
export function IconCoordinador({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="M6.5 7.5a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M3 19a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v3H3z" />
    </BaseFill>
  );
}

// IconCorista (TDesign User Filled)
export function IconCorista({ color = 'currentColor', size = 20, ...p }) {
  return (
    <BaseFill color={color} size={size} {...p}>
      <path d="M6.5 7.5a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M3 19a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v3H3z" />
    </BaseFill>
  );
}

/* --- Navegación / Flechas (Estilo Trazos) --- */

export function IconArrowLeft({ color = 'currentColor', size = 20, ...p }) {
  return (
    <Base color={color} size={size} {...p}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </Base>
  );
}

export function IconArrowRight({ color = 'currentColor', size = 20, ...p }) {
  return (
    <Base color={color} size={size} {...p}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Base>
  );
}

/* --- Búsqueda --- */

export function IconSearch({ color = '#8c8272', size = 18, ...p }) {
  return (
    <Base color={color} size={size} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Base>
  );
}

/* --- Eliminar --- */

export function IconTrash({ color = 'currentColor', size = 18, ...p }) {
  return (
    <Base color={color} size={size} {...p}>
      <path d="M4 7h16" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <path d="M6 7l1 13a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8l1-13" />
      <path d="M10 11v6M14 11v6" />
    </Base>
  );
}

export function IconX({ color = 'currentColor', size = 14, ...p }) {
  return (
    <Base color={color} size={size} {...p}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </Base>
  );
}