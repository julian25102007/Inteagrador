import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listarPublicaciones, crearPublicacion, actualizarPublicacion, eliminarPublicacionApi } from '../../api/client';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';
import './Publicaciones.css';
import { IconSearch } from '../../components/Icons.jsx';

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function hace(fechaIso) {
  if (!fechaIso) return '';
  const diffMs = Date.now() - new Date(fechaIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

const VACIO = { titulo: '', tipo: '', descripcion: '' };

export default function Publicaciones() {
  const { isCoordinador, user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [showNueva, setShowNueva] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [eliminarId, setEliminarId] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState(VACIO);
  const [publicacionesTodas, setPublicacionesTodas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    setCargando(true);
    listarPublicaciones()
      .then((data) => setPublicacionesTodas(data.map((p) => ({
        id: p.idPublicacion,
        idUsuario: p.idUsuario,
        autor: p.idUsuario === user?.idUsuario ? (user?.nombreCompleto || 'Tú') : 'Miembro del equipo',
        tipo: p.categoria,
        hace: hace(p.fechaPublicacion),
        titulo: p.titulo,
        contenido: p.descripcion
      }))))
      .catch((err) => setError(err.message || 'No se pudieron cargar las publicaciones.'))
      .finally(() => setCargando(false));
  }, [user]);

  useEffect(() => { cargar(); }, [cargar]);

  const publicaciones = publicacionesTodas.filter((p) =>
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirNueva = () => {
    setEditandoId(null);
    setForm(VACIO);
    setShowNueva(true);
  };

  const abrirEditar = (p) => {
    setEditandoId(p.id);
    setForm({ titulo: p.titulo, tipo: p.tipo, descripcion: p.contenido || '' });
    setShowNueva(true);
  };

  const handleAgregar = async () => {
    const tituloLimpio = form.titulo.trim();
    if (!tituloLimpio) {
      setToast('El título de la publicación es obligatorio.');
      return;
    }
    if (!form.tipo) {
      setToast('Selecciona el tipo de publicación.');
      return;
    }
    try {
      if (editandoId) {
        await actualizarPublicacion(editandoId, { titulo: tituloLimpio, categoria: form.tipo, descripcion: form.descripcion });
        setToast('¡Actualizada! La publicación se guardó correctamente.');
      } else {
        await crearPublicacion({
          titulo: tituloLimpio, categoria: form.tipo || 'Aviso', descripcion: form.descripcion,
          idUsuario: user?.idUsuario
        });
        setToast('¡Agregado exitoso! Tu publicación ha sido agregada correctamente.');
      }
      setShowNueva(false);
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo guardar la publicación.');
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarPublicacionApi(eliminarId);
      setEliminarId(null);
      setToast('La publicación fue eliminada.');
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo eliminar la publicación.');
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div className="search-input">
          <IconSearch />
          <input placeholder="Buscar Publicaciones" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        {isCoordinador && (
          <button className="btn btn-primary" onClick={abrirNueva}>+ Nueva Publicación</button>
        )}
      </div>

      {error && <div className="empty-state">{error}</div>}

      {publicaciones.map((p) => (
        <div className="post-card" key={p.id}>
          <div className="post-card__header">
            <div className="post-card__avatar">{initials(p.autor)}</div>
            <div>
              <div className="post-card__author">{p.autor}</div>
              <div className="post-card__time">{p.hace}</div>
            </div>
            <span className="post-card__tag">{p.tipo}</span>
          </div>
          <div className="post-card__title">{p.titulo}</div>
          <p className="post-card__body">{p.contenido}</p>
          {isCoordinador && (
            <div className="post-card__actions">
              <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => setEliminarId(p.id)}>Eliminar</button>
            </div>
          )}
        </div>
      ))}

      {!cargando && publicaciones.length === 0 && (
        <div className="empty-state">
          <h3>Sin publicaciones</h3>
          <p>No hay avisos que coincidan con tu búsqueda.</p>
        </div>
      )}

      {showNueva && (
        <Modal
          title={editandoId ? 'Editar publicación' : 'Nueva publicación'}
          onClose={() => setShowNueva(false)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setShowNueva(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAgregar}>{editandoId ? 'Guardar' : 'Agregar'}</button>
            </>
          }
        >
          <div className="field">
            <label>Título</label>
            <input maxLength={80} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            <span className="field-hint">{form.titulo.length}/80 caracteres</span>
          </div>
          <div className="field">
            <label>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="">Selecciona</option>
              <option value="Aviso">Aviso</option>
              <option value="Evento">Evento</option>
              <option value="General">General</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea rows={4} maxLength={500} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            <span className="field-hint">{form.descripcion.length}/500 caracteres</span>
          </div>
        </Modal>
      )}

      {eliminarId !== null && (
        <Modal
          title="Eliminar"
          onClose={() => setEliminarId(null)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setEliminarId(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleEliminar}>Eliminar</button>
            </>
          }
        >
          <p>¿Deseas eliminar esta publicación?</p>
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
