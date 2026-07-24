import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCantos } from '../../context/CantosContext.jsx';
import { useListas } from '../../context/ListasContext.jsx';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';
import { IconSearch } from '../../components/Icons.jsx';

const VACIO = { nombre: '', descripcion: '', cantos: [] };

export default function CantosListas() {
  const navigate = useNavigate();
  const { isCoordinador } = useAuth();
  const { cantos: todosLosCantos } = useCantos();
  const { listas, cargando, error, agregarLista, editarLista, eliminarLista } = useListas();

  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState(VACIO);
  const [buscarCanto, setBuscarCanto] = useState('');

  const listasFiltradas = listas.filter((l) => l.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const sugerenciasCantos = todosLosCantos.filter(
    (c) => buscarCanto && c.titulo.toLowerCase().includes(buscarCanto.toLowerCase()) && !form.cantos.includes(c.id)
  );

  const abrirNueva = () => {
    setEditandoId(null);
    setForm(VACIO);
    setBuscarCanto('');
    setShowModal(true);
  };

  const abrirEditar = (e, lista) => {
    e.stopPropagation();
    setEditandoId(lista.id);
    setForm({ nombre: lista.nombre, descripcion: lista.descripcion, cantos: lista.cantos || [] });
    setBuscarCanto('');
    setShowModal(true);
  };

  const handleEliminar = async (e, lista) => {
    e.stopPropagation();
    try {
      await eliminarLista(lista.id);
      setToast('Lista eliminada.');
    } catch (err) {
      setToast(err.message || 'No se pudo eliminar la lista.');
    }
  };

  const agregarCantoALista = (canto) => {
    setForm((prev) => ({ ...prev, cantos: [...prev.cantos, canto.id] }));
    setBuscarCanto('');
  };

  const quitarCantoDeLista = (id) => {
    setForm((prev) => ({ ...prev, cantos: prev.cantos.filter((c) => c !== id) }));
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setToast('El nombre de la lista es obligatorio.');
      return;
    }
    try {
      if (editandoId) {
        await editarLista(editandoId, form);
        setToast('¡Actualizada! La lista se guardó correctamente.');
      } else {
        await agregarLista(form);
        setToast('¡Agregado exitoso! Tu lista ha sido creada correctamente.');
      }
      setShowModal(false);
      setForm(VACIO);
      setEditandoId(null);
    } catch (err) {
      setToast(err.message || 'No se pudo guardar la lista.');
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div className="search-input">
          <IconSearch />
          <input placeholder="Buscar Lista" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        {isCoordinador && (
          <button className="btn btn-primary" onClick={abrirNueva}>+ Nueva Lista</button>
        )}
      </div>

      {error && <div className="empty-state">{error}</div>}

      <div className="listas-grid">
        {listasFiltradas.map((lista) => (
          <div className="lista-card" key={lista.id} onClick={() => navigate(`/cantos/listas/${lista.id}`)} role="button">
            <span className="lista-card__title">{lista.nombre}</span>
            <p className="lista-card__desc">{lista.descripcion}</p>
            <div className="lista-card__footer">
              <span className="lista-card__count">{lista.total} Cantos</span>
              {isCoordinador && (
                <div className="lista-card__actions">
                  <button className="btn btn-ghost btn-sm" onClick={(e) => abrirEditar(e, lista)}>Editar</button>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => handleEliminar(e, lista)}>Eliminar</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          title={editandoId ? 'Editar lista' : 'Nueva lista'}
          onClose={() => setShowModal(false)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardar}>{editandoId ? 'Guardar' : 'Agregar'}</button>
            </>
          }
        >
          <div className="field">
            <label>Nombre de la lista</label>
            <input
              placeholder="Ingrese el nombre de la lista"
              maxLength={60}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <span className="field-hint">{form.nombre.length}/60 caracteres</span>
          </div>

          <div className="field">
            <label>Descripción corta</label>
            <textarea
              rows={3}
              maxLength={200}
              placeholder="Ingrese una descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <span className="field-hint">{form.descripcion.length}/200 caracteres</span>
          </div>

          <div className="field" style={{ position: 'relative' }}>
            <label>Seleccionar cantos</label>
            <div className="search-input">
              <IconSearch />
              <input
                placeholder="Seleccionar cantos"
                value={buscarCanto}
                onChange={(e) => setBuscarCanto(e.target.value)}
              />
            </div>
            {sugerenciasCantos.length > 0 && (
              <div className="canto-suggestions">
                {sugerenciasCantos.map((c) => (
                  <button type="button" key={c.id} className="canto-suggestions__item" onClick={() => agregarCantoALista(c)}>
                    {c.titulo}
                  </button>
                ))}
              </div>
            )}
            {form.cantos.length > 0 && (
              <div className="selected-chips">
                {form.cantos.map((id) => {
                  const c = todosLosCantos.find((x) => x.id === id);
                  if (!c) return null;
                  return (
                    <span className="selected-chip" key={id}>
                      {c.titulo}
                      <button type="button" onClick={() => quitarCantoDeLista(id)}>×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
