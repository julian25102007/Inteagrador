import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCantos } from '../../context/CantosContext.jsx';
import {
  listarEsquemas, crearEsquema, actualizarEsquema, eliminarEsquemaApi,
  listarDetalleEsquema, crearDetalleEsquema, eliminarDetalleEsquemaApi
} from '../../api/client';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';
import { IconArrowRight, IconSearch, IconTrash, IconX } from '../../components/Icons.jsx';

function filaVacia() {
  return { idMomento: '', idCanto: null, cantoTitulo: '', buscarCanto: '', confirmado: false };
}

export default function CantosEsquemas() {
  const { isCoordinador, user } = useAuth();
  const { cantos, momentos } = useCantos();

  const [esquemasBase, setEsquemasBase] = useState([]); // [{idEsquema, nombre}]
  const [detallesBase, setDetallesBase] = useState([]); // [{idDetalle, idEsquema, idMomento, idCanto, orden}]
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [toast, setToast] = useState('');
  const [nombre, setNombre] = useState('');
  const [filas, setFilas] = useState([filaVacia()]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [esq, det] = await Promise.all([listarEsquemas(), listarDetalleEsquema()]);
      setEsquemasBase(esq);
      setDetallesBase(det);
      if (esq.length && seleccionadoId === null) setSeleccionadoId(esq[0].idEsquema);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los esquemas.');
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const nombreMomento = (id) => momentos.find((m) => m.idMomento === id)?.nombre || '';
  const canto = (id) => cantos.find((c) => c.id === id);

  const esquemas = esquemasBase.map((esq) => {
    const momentosEsq = detallesBase
      .filter((d) => d.idEsquema === esq.idEsquema)
      .sort((a, b) => a.orden - b.orden)
      .map((d) => ({ idDetalle: d.idDetalle, momento: nombreMomento(d.idMomento), canto: canto(d.idCanto)?.titulo || '(canto eliminado)', autor: canto(d.idCanto)?.autor || '—' }));
    return {
      id: esq.idEsquema,
      nombre: esq.nombre,
      resumen: momentosEsq.map((m) => m.momento).join(', ') || 'Sin momentos asignados',
      momentos: momentosEsq
    };
  });

  const esquemasFiltrados = esquemas.filter((e) => e.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const seleccionado = esquemas.find((e) => e.id === seleccionadoId) || null;

  const abrirNuevo = () => {
    setEditandoId(null);
    setNombre('');
    setFilas([filaVacia()]);
    setShowModal(true);
  };

  const abrirEditar = (e, esq) => {
    e.stopPropagation();
    const detallesDe = detallesBase.filter((d) => d.idEsquema === esq.id).sort((a, b) => a.orden - b.orden);
    setEditandoId(esq.id);
    setNombre(esq.nombre);
    setFilas(
      detallesDe.length
        ? detallesDe.map((d) => ({
            idMomento: d.idMomento, idCanto: d.idCanto,
            cantoTitulo: canto(d.idCanto)?.titulo || '', buscarCanto: '', confirmado: true
          }))
        : [filaVacia()]
    );
    setShowModal(true);
  };

  const handleEliminar = async (e, esq) => {
    e.stopPropagation();
    try {
      await eliminarEsquemaApi(esq.id);
      if (seleccionadoId === esq.id) setSeleccionadoId(null);
      setToast('Esquema eliminado.');
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo eliminar el esquema.');
    }
  };

  const agregarMomento = () => {
    const usados = new Set(filas.filter((f) => f.idMomento).map((f) => f.idMomento));
    if (usados.size >= momentos.length) {
      setToast('Ya agregaste todos los momentos disponibles.');
      return;
    }
    setFilas((prev) => [
      ...prev.map((f) => (f.idMomento && f.idCanto ? { ...f, confirmado: true } : f)),
      filaVacia()
    ]);
  };

  const actualizarFila = (i, campo, valor) => {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
  };

  const elegirCanto = (i, c) => {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, idCanto: c.id, cantoTitulo: c.titulo, buscarCanto: '' } : f)));
  };

  const confirmarFila = (i) => {
    setFilas((prev) => prev.map((f, idx) => (idx === i && f.idMomento && f.idCanto ? { ...f, confirmado: true } : f)));
  };

  const reabrirFila = (i) => {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, confirmado: false } : f)));
  };

  const quitarFila = (i) => setFilas((prev) => prev.filter((_, idx) => idx !== i));

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setToast('El nombre del esquema es obligatorio.');
      return;
    }
    // Filtra filas incompletas y, por seguridad, descarta cualquier
    // momento duplicado que se hubiera colado (el <select> ya lo evita,
    // esto es solo una red de seguridad extra).
    const vistos = new Set();
    const filasListas = filas.filter((f) => {
      if (!f.idMomento || !f.idCanto) return false;
      if (vistos.has(f.idMomento)) return false;
      vistos.add(f.idMomento);
      return true;
    });
    if (filasListas.length === 0) {
      setToast('Agrega al menos un momento con su canto correspondiente.');
      return;
    }
    try {
      let idEsquema = editandoId;
      if (editandoId) {
        await actualizarEsquema(editandoId, { nombre, idUsuario: user?.idUsuario });
        // Reemplaza el detalle completo: borra lo viejo y crea lo nuevo.
        const viejos = detallesBase.filter((d) => d.idEsquema === editandoId);
        for (const d of viejos) await eliminarDetalleEsquemaApi(d.idDetalle);
      } else {
        const creado = await crearEsquema({ nombre, idUsuario: user?.idUsuario });
        idEsquema = creado.idEsquema;
      }
      let orden = 1;
      for (const f of filasListas) {
        await crearDetalleEsquema({ idEsquema, idMomento: f.idMomento, idCanto: f.idCanto, orden: orden++ });
      }
      setToast(editandoId ? '¡Actualizado! El esquema se guardó correctamente.' : '¡Agregado exitoso! Tu esquema ha sido agregado correctamente.');
      setShowModal(false);
      setSeleccionadoId(idEsquema);
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo guardar el esquema.');
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div className="search-input">
          <IconSearch />
          <input placeholder="Buscar Esquema" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        {isCoordinador && (
          <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Esquema</button>
        )}
      </div>

      {error && <div className="empty-state">{error}</div>}

      <div className="canto-detail-layout">
        <div className="esquemas-list">
          {esquemasFiltrados.map((esq) => (
            <div
              key={esq.id}
              className="esquema-row"
              style={{ border: seleccionadoId === esq.id ? '1.5px solid #c9a15a' : undefined, cursor: 'pointer' }}
              onClick={() => setSeleccionadoId(esq.id)}
            >
              <div>
                <div className="esquema-row__title">{esq.nombre}</div>
                <div className="esquema-row__desc">{esq.resumen}</div>
                {isCoordinador && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => abrirEditar(e, esq)}>Editar</button>
                    <button className="btn btn-ghost btn-sm icon-btn" onClick={(e) => handleEliminar(e, esq)} aria-label="Eliminar esquema" title="Eliminar">
                      <IconTrash size={16} />
                    </button>
                  </div>
                )}
              </div>
              <IconArrowRight size={16} />
            </div>
          ))}
          {!cargando && esquemasFiltrados.length === 0 && (
            <div className="empty-state">No hay esquemas todavía.</div>
          )}
        </div>

        <div className="card card-pad">
          {seleccionado?.momentos?.length ? (
            <>
              <h3 style={{ fontSize: 17, marginBottom: 4 }}>{seleccionado.nombre}</h3>
              <p style={{ fontSize: 13, color: '#8c8272', marginBottom: 16 }}>Momentos: {seleccionado.resumen}</p>
              <table className="evan-table">
                <thead><tr><th>Momento</th><th>Canto asignado</th><th>Autor</th></tr></thead>
                <tbody>
                  {seleccionado.momentos.map((m, i) => (
                    <tr key={i}><td>{m.momento}</td><td style={{ fontWeight: 700 }}>{m.canto}</td><td>{m.autor}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="empty-state">
              <h3>Sin detalle</h3>
              <p>Este esquema aún no tiene cantos asignados por momento.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editandoId ? 'Editar esquema' : 'Nuevo esquema'}
          onClose={() => setShowModal(false)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardar}>{editandoId ? 'Guardar' : 'Agregar'}</button>
            </>
          }
        >
          <div className="field">
            <label>Nombre del esquema</label>
            <input placeholder="Ingrese el nombre del esquema" value={nombre} maxLength={60} onChange={(e) => setNombre(e.target.value)} />
            <span className="field-hint">{nombre.length}/60 caracteres</span>
          </div>

          <button type="button" className="btn-add-momento" onClick={agregarMomento}>+ Agregar momento</button>

          {filas.map((fila, i) =>
            fila.confirmado ? (
              <div className="momento-chip" key={i}>
                <button type="button" className="momento-chip__label" onClick={() => reabrirFila(i)} title="Editar">
                  {nombreMomento(fila.idMomento)}: {fila.cantoTitulo}
                </button>
                <button type="button" className="momento-chip__remove" onClick={() => quitarFila(i)} aria-label="Quitar momento">×</button>
              </div>
            ) : (
              <div
                className="momento-card"
                key={i}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) confirmarFila(i);
                }}
              >
                <button type="button" className="momento-card__remove" onClick={() => quitarFila(i)} aria-label="Quitar momento" title="Descartar">
                  <IconX size={12} />
                </button>
                <div className="momento-card__fields">
                  <div className="field">
                    <label>Momento misa</label>
                    <select value={fila.idMomento} onChange={(e) => actualizarFila(i, 'idMomento', Number(e.target.value))}>
                      <option value="">Seleccione el momento misa</option>
                      {momentos.filter((m) => m.idMomento === fila.idMomento || !filas.some((f, idx) => idx !== i && f.idMomento === m.idMomento))
                        .map((m) => <option key={m.idMomento} value={m.idMomento}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ position: 'relative' }}>
                    <label>Canto</label>
                    <div className="search-input">
                      <IconSearch />
                      <input
                        placeholder={fila.cantoTitulo || 'Buscar canto'}
                        value={fila.buscarCanto}
                        onChange={(e) => actualizarFila(i, 'buscarCanto', e.target.value)}
                      />
                    </div>
                    {fila.buscarCanto && (
                      <div className="canto-suggestions">
                        {cantos.filter((c) => c.titulo.toLowerCase().includes(fila.buscarCanto.toLowerCase())).slice(0, 6).map((c) => (
                          <button type="button" key={c.id} className="canto-suggestions__item" onClick={() => elegirCanto(i, c)}>
                            {c.titulo}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
