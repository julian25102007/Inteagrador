import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCantos } from '../../context/CantosContext.jsx';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';
import { IconSearch } from '../../components/Icons.jsx';

const DIFICULTADES = ['Baja', 'Media', 'Alta'];

const VACIO = { titulo: '', autor: '', liturgico: '', momento: '', dificultad: '', letra: '', youtube: '' };

function badgeClass(dificultad) {
  return { Baja: 'badge-baja', Media: 'badge-media', Alta: 'badge-alta' }[dificultad] || '';
}

export default function CantosList() {
  const { isCoordinador } = useAuth();
  const { cantos, detalles, tiempos, momentos, cargando, error, agregarCanto, editarCanto, eliminarCanto } = useCantos();
  const LITURGICOS = tiempos.map((t) => t.nombre);
  const MOMENTOS = momentos.map((m) => m.nombre);

  const [busqueda, setBusqueda] = useState('');
  const [momento, setMomento] = useState('');
  const [liturgico, setLiturgico] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState(VACIO);

  const cantosFiltrados = useMemo(() => {
    return cantos.filter((c) => {
      const matchBusqueda = c.titulo.toLowerCase().includes(busqueda.toLowerCase());
      const matchMomento = !momento || c.momento === momento;
      const matchLiturgico = !liturgico || c.liturgico === liturgico;
      const matchDificultad = !dificultad || c.dificultad === dificultad;
      return matchBusqueda && matchMomento && matchLiturgico && matchDificultad;
    });
  }, [cantos, busqueda, momento, liturgico, dificultad]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(VACIO);
    setShowModal(true);
  };

  const abrirEditar = (c) => {
    setEditandoId(c.id);
    setForm({
      titulo: c.titulo,
      autor: c.autor,
      liturgico: c.liturgico,
      momento: c.momento,
      dificultad: c.dificultad,
      letra: detalles?.[c.id]?.letra || '',
      youtube: detalles?.[c.id]?.youtube || ''
    });
    setShowModal(true);
  };

  const handleGuardar = async () => {
    const tituloLimpio = form.titulo.trim();
    if (!tituloLimpio) {
      setToast('El título del canto es obligatorio.');
      return;
    }
    if (tituloLimpio.length > 60) {
      setToast('El título de la canción no puede superar los 60 caracteres.');
      return;
    }
    if (!form.liturgico) {
      setToast('Selecciona el tiempo litúrgico.');
      return;
    }
    if (!form.momento) {
      setToast('Selecciona el momento de la misa.');
      return;
    }
    if (!form.dificultad) {
      setToast('Selecciona la dificultad del canto.');
      return;
    }
    try {
      if (editandoId) {
        await editarCanto(editandoId, form);
        setToast('¡Actualizado! El canto se guardó correctamente.');
      } else {
        await agregarCanto(form);
        setToast('¡Agregado exitoso! Tu canto ha sido agregado correctamente.');
      }
      setShowModal(false);
      setForm(VACIO);
      setEditandoId(null);
    } catch (err) {
      setToast(err.message || 'No se pudo guardar el canto.');
    }
  };

  const handleEliminar = async (c) => {
    try {
      await eliminarCanto(c.id);
      setToast('Canto eliminado.');
    } catch (err) {
      setToast(err.message || 'No se pudo eliminar el canto.');
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div className="search-input">
          <IconSearch />
          <input
            placeholder="Buscar Cantos"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {isCoordinador && (
          <button className="btn btn-primary" onClick={abrirNuevo}>
            + Nueva canción
          </button>
        )}
      </div>

      <div className="filters-row">
        <select className="filter-chip" value={liturgico} onChange={(e) => setLiturgico(e.target.value)}>
          <option value="">T. Litúrgico</option>
          {LITURGICOS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select className="filter-chip" value={momento} onChange={(e) => setMomento(e.target.value)}>
          <option value="">Mo. Misa</option>
          {MOMENTOS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select className="filter-chip" value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
          <option value="">Dificultad</option>
          {DIFICULTADES.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {error && <div className="empty-state">{error}</div>}

      <div className="table-wrap">
        <table className="evan-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>T. Litúrgico</th>
              <th>Momento</th>
              <th>Dificultad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cantosFiltrados.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700 }}>{c.titulo}</td>
                <td>{c.autor}</td>
                <td>{c.liturgico}</td>
                <td>{c.momento}</td>
                <td>
                  <span className={`badge ${badgeClass(c.dificultad)}`}>{c.dificultad}</span>
                </td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Link to={`/cantos/${c.id}`} className="btn btn-ghost btn-sm">
                    Ver
                  </Link>
                  {isCoordinador && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(c)}>Editar</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEliminar(c)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!cargando && cantosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No se encontraron cantos con esos filtros.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editandoId ? 'Editar canción' : 'Nueva canción'}
          onClose={() => setShowModal(false)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardar}>{editandoId ? 'Guardar' : 'Agregar'}</button>
            </>
          }
        >
          <div className="field">
            <label>Título</label>
            <input
              maxLength={60}
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
            <span className="field-hint">
              {form.titulo.length}/60 caracteres — se usa para generar la carpeta del canto.
            </span>
          </div>
          <div className="field">
            <label>Autor</label>
            <input maxLength={60} value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} />
          </div>
          <div className="field">
            <label>T. Litúrgico</label>
            <select value={form.liturgico} onChange={(e) => setForm({ ...form, liturgico: e.target.value })}>
              <option value="">Selecciona</option>
              {LITURGICOS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Momento</label>
            <select value={form.momento} onChange={(e) => setForm({ ...form, momento: e.target.value })}>
              <option value="">Selecciona</option>
              {MOMENTOS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Dificultad</label>
            <select value={form.dificultad} onChange={(e) => setForm({ ...form, dificultad: e.target.value })}>
              <option value="">Selecciona</option>
              {DIFICULTADES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>URL de YouTube</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtube}
              onChange={(e) => setForm({ ...form, youtube: e.target.value })}
            />
            <span className="field-hint">Opcional — enlace al video del canto.</span>
          </div>
          <div className="field">
            <label>Letra y acordes</label>
            <textarea
              rows={6}
              maxLength={3000}
              placeholder={'Ej. [Do]Junto a ti Ma[Sol]ría...\nUsa [Acorde] antes de cada sílaba donde cambia.'}
              value={form.letra}
              onChange={(e) => setForm({ ...form, letra: e.target.value })}
            />
            <span className="field-hint">{form.letra.length}/3000 caracteres</span>
          </div>
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
