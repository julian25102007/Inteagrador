import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listarInventario, crearInventario, actualizarInventario, eliminarInventarioApi } from '../../api/client';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';
import { IconSearch } from '../../components/Icons.jsx';

function badgeClass(estado) {
  if (estado === 'En uso') return 'badge-uso';
  if (estado === 'En buen estado') return 'badge-buen';
  return 'badge-mal';
}

const VACIO = { articulo: '', categoria: '', estado: '', modelo: '' };

export default function Inventario() {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [showNuevo, setShowNuevo] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [eliminarId, setEliminarId] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState(VACIO);
  const [inventarioTodo, setInventarioTodo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    setCargando(true);
    listarInventario()
      .then((data) => setInventarioTodo(data.map((i) => ({
        id: i.idArticulo, articulo: i.nombre, categoria: i.categoria, estado: i.estado, modelo: i.modelo
      }))))
      .catch((err) => setError(err.message || 'No se pudo cargar el inventario.'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const items = inventarioTodo.filter((i) => i.articulo.toLowerCase().includes(busqueda.toLowerCase()));

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(VACIO);
    setShowNuevo(true);
  };

  const abrirEditar = (i) => {
    setEditandoId(i.id);
    setForm({ articulo: i.articulo, categoria: i.categoria, estado: i.estado, modelo: i.modelo });
    setShowNuevo(true);
  };

  const handleAgregar = async () => {
    const nombreLimpio = form.articulo.trim();
    if (!nombreLimpio) {
      setToast('El nombre del artículo es obligatorio.');
      return;
    }
    if (!form.categoria) {
      setToast('Selecciona una categoría.');
      return;
    }
    if (!form.estado) {
      setToast('Selecciona el estado del artículo.');
      return;
    }
    try {
      if (editandoId) {
        await actualizarInventario(editandoId, {
          nombre: nombreLimpio, categoria: form.categoria, estado: form.estado, modelo: form.modelo
        });
        setToast('¡Actualizado! El artículo se guardó correctamente.');
      } else {
        await crearInventario({
          nombre: nombreLimpio, categoria: form.categoria, estado: form.estado, modelo: form.modelo,
          idUsuario: user?.idUsuario
        });
        setToast('¡Agregado exitoso! Tu artículo ha sido agregado correctamente.');
      }
      setShowNuevo(false);
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo guardar el artículo.');
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarInventarioApi(eliminarId);
      setEliminarId(null);
      setToast('El artículo fue eliminado.');
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo eliminar el artículo.');
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div className="search-input">
          <IconSearch />
          <input placeholder="Buscar Artículos" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Artículo</button>
      </div>

      {error && <div className="empty-state">{error}</div>}

      <div className="table-wrap">
        <table className="evan-table">
          <thead>
            <tr><th>Artículo</th><th>Categoría</th><th>Estado</th><th>Modelo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td style={{ fontWeight: 700 }}>{i.articulo}</td>
                <td>{i.categoria}</td>
                <td><span className={`badge ${badgeClass(i.estado)}`}>{i.estado}</span></td>
                <td>{i.modelo}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ marginRight: 8 }} onClick={() => abrirEditar(i)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setEliminarId(i.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!cargando && items.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state">No hay artículos que coincidan con tu búsqueda.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showNuevo && (
        <Modal
          title={editandoId ? 'Editar artículo' : 'Nuevo artículo'}
          onClose={() => setShowNuevo(false)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setShowNuevo(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAgregar}>{editandoId ? 'Guardar' : 'Agregar'}</button>
            </>
          }
        >
          <div className="field">
            <label>Artículo</label>
            <input maxLength={60} value={form.articulo} onChange={(e) => setForm({ ...form, articulo: e.target.value })} />
            <span className="field-hint">{form.articulo.length}/60 caracteres</span>
          </div>
          <div className="field">
            <label>Categoría</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              <option value="">Selecciona</option>
              <option>Sonido</option>
              <option>Iluminacion</option>
              <option>Instrumento</option>
              <option>Accesorios</option>
              <option>Cables</option>
            </select>
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              <option value="">Selecciona</option>
              <option>En uso</option>
              <option>En buen estado</option>
              <option>En mal estado</option>
            </select>
          </div>
          <div className="field">
            <label>Modelo</label>
            <input maxLength={40} value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
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
          <p>¿Deseas eliminar este artículo?</p>
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
