import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';
import { listarCorreosCoordinador, invitarCorreoCoordinador, eliminarCorreoCoordinador, actualizarPerfil } from '../../api/client';
import './Configuracion.css';

function formatearFecha(fechaIso) {
  if (!fechaIso) return '—';
  const fecha = new Date(fechaIso);
  if (isNaN(fecha.getTime())) return fechaIso;
  return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Configuracion() {
  const { user, role, isCoordinador, logout, updateUser } = useAuth();

  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(user?.nombreCompleto || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');

  const [showLogout, setShowLogout] = useState(false);
  const [toast, setToast] = useState('');

  // --- Whitelist de coordinadores ---
  const [correos, setCorreos] = useState([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [errorCorreo, setErrorCorreo] = useState('');

  const cargarCorreos = useCallback(() => {
    if (!isCoordinador) return;
    listarCorreosCoordinador().then(setCorreos).catch(() => {});
  }, [isCoordinador]);

  useEffect(() => { cargarCorreos(); }, [cargarCorreos]);

  const agregarCorreo = async (e) => {
    e.preventDefault();
    setErrorCorreo('');
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(nuevoCorreo)) {
      setErrorCorreo('Ingresa un correo electrónico con una extensión válida (ej. .com, .mx).');
      return;
    }
    try {
      await invitarCorreoCoordinador(nuevoCorreo);
      setNuevoCorreo('');
      setToast('Correo agregado a la lista de coordinadores');
      cargarCorreos();
    } catch (err) {
      setErrorCorreo(err.message || 'No se pudo agregar el correo.');
    }
  };

  const quitarCorreo = async (idCorreo, correoUtilizado) => {
    if (correoUtilizado) {
      const confirmar = window.confirm(
        'Este correo ya se usó para crear una cuenta de Coordinador. ' +
        'Si lo quitas, esa cuenta perderá el acceso de Coordinador y pasará a ser Corista. ¿Continuar?'
      );
      if (!confirmar) return;
    }
    try {
      const resultado = await eliminarCorreoCoordinador(idCorreo);
      setToast(resultado || 'Correo eliminado');
      cargarCorreos();
    } catch (err) {
      setToast(err.message || 'No se pudo eliminar.');
    }
  };

  const [guardando, setGuardando] = useState(false);

  const guardarPerfil = async () => {
    setGuardando(true);
    try {
      await actualizarPerfil(user.idUsuario, {
        nombreCompleto: nombre,
        correo: user.correo,
        telefono: telefono || null,
        fotoPerfil: user.fotoPerfil || null,
        observacion: user.observacion || null
      });
      updateUser({ nombreCompleto: nombre, telefono });
      setEditando(false);
      setToast('Cambios guardados');
    } catch (err) {
      setToast(err.message || 'No se pudo guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="profile-layout">
      <div className="card card-pad">
        <h3 style={{ marginBottom: 20 }}>Perfil</h3>

        {!editando ? (
          <>
            <div className="profile-row"><span className="profile-row__label">Rol</span><span className="profile-row__value">{isCoordinador ? 'Coordinador' : 'Corista'}</span></div>
            <div className="profile-row"><span className="profile-row__label">Nombre</span><span className="profile-row__value">{user?.nombreCompleto}</span></div>
            <div className="profile-row"><span className="profile-row__label">Teléfono</span><span className="profile-row__value">{user?.telefono}</span></div>
            <div className="profile-row"><span className="profile-row__label">Correo electrónico</span><span className="profile-row__value">{user?.correo}</span></div>
            <div className="profile-row"><span className="profile-row__label">Fecha de registro</span><span className="profile-row__value">{formatearFecha(user?.fechaRegistro)}</span></div>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setEditando(true)}>Editar perfil</button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#8c8272', marginBottom: 16 }}>
              Actualiza tu información personal. Los cambios se reflejarán en tu perfil.
            </p>
            <div className="field"><label>Nombre</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
            <div className="field"><label>Teléfono</label><input value={telefono} onChange={(e) => setTelefono(e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setEditando(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarPerfil} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
          </>
        )}

        <div className="danger-zone">
          <button className="btn btn-danger" onClick={() => setShowLogout(true)}>Cerrar sesión</button>
        </div>
      </div>

      {isCoordinador && (
        <div className="card card-pad" style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 8 }}>Correos autorizados como Coordinador</h3>
          <p style={{ fontSize: 13, color: '#8c8272', marginBottom: 16 }}>
            Solo los correos de esta lista pueden registrarse eligiendo el rol
            "Coordinador". Agrega aquí el correo de la persona antes de que se registre.
          </p>

          <form onSubmit={agregarCorreo} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={nuevoCorreo}
              onChange={(e) => setNuevoCorreo(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Agregar</button>
          </form>
          {errorCorreo && <span className="field-error">{errorCorreo}</span>}

          {correos.length === 0 ? (
            <p style={{ fontSize: 13, color: '#8c8272' }}>Aún no hay correos en la lista.</p>
          ) : (
            correos.map((c) => (
              <div key={c.idCorreo} className="profile-row">
                <span className="profile-row__label">
                  {c.correo} {c.utilizado ? '(ya registrado)' : '(pendiente)'}
                </span>
                <button className="btn btn-ghost" onClick={() => quitarCorreo(c.idCorreo, c.utilizado)}>
                  Quitar
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showLogout && (
        <Modal
          title="Cerrar sesión"
          onClose={() => setShowLogout(false)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setShowLogout(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={logout}>Cerrar sesión</button>
            </>
          }
        >
          <p>¿Estás seguro que quieres cerrar tu sesión?</p>
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
