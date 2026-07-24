import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listarEventos, crearEvento, actualizarEvento, eliminarEventoApi, registrarAsistencia } from '../../api/client';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';
import { IconArrowLeft, IconArrowRight } from '../../components/Icons.jsx';
import './Horario.css';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function sumarHora(hora, horas) {
  if (!hora) return hora;
  const [h, m] = hora.split(':').map(Number);
  const total = (h + horas) % 24;
  return `${String(total).padStart(2, '0')}:${m ? String(m).padStart(2, '0') : '00'}`;
}

export default function Horario() {
  const { isCoordinador, user } = useAuth();

  const hoy = new Date();
  const [año, setAño] = useState(hoy.getFullYear());
  const [mesIndex, setMesIndex] = useState(hoy.getMonth());

  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [asistenciaPorEvento, setAsistenciaPorEvento] = useState({}); // { [idEvento]: 'si' | 'no' }
  const [confirmando, setConfirmando] = useState(null); // { idEvento, tipo }
  const [showNuevo, setShowNuevo] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [toast, setToast] = useState('');
  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', ubicacion: '', descripcion: '', hora: '', dia: '1' });

  const cargar = useCallback(() => {
    setCargando(true);
    listarEventos()
      .then((data) => setEventos(data.map((e) => ({
        id: e.idEvento,
        titulo: e.nombre,
        fecha: e.fecha, // 'YYYY-MM-DD'
        hora: e.horaInicio ? e.horaInicio.slice(0, 5) : '—',
        horaFin: e.horaFin,
        ubicacion: e.lugar,
        descripcion: e.descripcion
      }))))
      .catch((err) => setError(err.message || 'No se pudieron cargar los eventos.'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const mesLabel = `${NOMBRES_MESES[mesIndex]} ${año}`;

  const diasEnMes = useMemo(() => new Date(año, mesIndex + 1, 0).getDate(), [año, mesIndex]);
  const primerDiaSemana = useMemo(() => new Date(año, mesIndex, 1).getDay(), [año, mesIndex]);

  const celdas = useMemo(() => {
    const arr = [];
    for (let i = 0; i < primerDiaSemana; i++) arr.push(null);
    for (let d = 1; d <= diasEnMes; d++) arr.push(d);
    return arr;
  }, [diasEnMes, primerDiaSemana]);

  const eventosPorDia = (dia) => {
    const fechaStr = `${año}-${String(mesIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return eventos.filter((e) => e.fecha === fechaStr);
  };

  const irMesAnterior = () => {
    setDiaSeleccionado(null);
    if (mesIndex === 0) { setMesIndex(11); setAño((a) => a - 1); } else { setMesIndex((m) => m - 1); }
  };

  const irMesSiguiente = () => {
    setDiaSeleccionado(null);
    if (mesIndex === 11) { setMesIndex(0); setAño((a) => a + 1); } else { setMesIndex((m) => m + 1); }
  };

  const confirmar = async (idEvento, tipo) => {
    try {
      await registrarAsistencia({
        idEvento,
        idUsuario: user?.idUsuario,
        asistira: tipo === 'si'
      });
      setAsistenciaPorEvento((prev) => ({ ...prev, [idEvento]: tipo }));
      setToast(tipo === 'si' ? 'Asistencia confirmada' : 'Inasistencia confirmada');
    } catch (err) {
      setToast(err.message || 'No se pudo registrar la asistencia.');
    } finally {
      setConfirmando(null);
    }
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setNuevoEvento({ titulo: '', ubicacion: '', descripcion: '', hora: '', dia: '1' });
    setShowNuevo(true);
  };

  const abrirEditar = (ev) => {
    setEditandoId(ev.id);
    const dia = Number(ev.fecha.split('-')[2]);
    setNuevoEvento({ titulo: ev.titulo, ubicacion: ev.ubicacion || '', descripcion: ev.descripcion || '', hora: ev.hora, dia: String(dia) });
    setShowNuevo(true);
  };

  const handleEliminarEvento = async (ev) => {
    try {
      await eliminarEventoApi(ev.id);
      setToast('Evento eliminado.');
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo eliminar el evento.');
    }
  };

  const handleAgregarEvento = async () => {
    if (!nuevoEvento.titulo.trim() || !nuevoEvento.hora) {
      setToast('El título y la hora son obligatorios.');
      return;
    }
    const dia = Math.min(Math.max(parseInt(nuevoEvento.dia, 10) || 1, 1), diasEnMes);
    const fechaStr = `${año}-${String(mesIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const payload = {
      nombre: nuevoEvento.titulo,
      fecha: fechaStr,
      horaInicio: nuevoEvento.hora,
      horaFin: sumarHora(nuevoEvento.hora, 1),
      lugar: nuevoEvento.ubicacion,
      descripcion: nuevoEvento.descripcion,
      activarAsistencia: true,
      idUsuario: user?.idUsuario
    };
    try {
      if (editandoId) {
        await actualizarEvento(editandoId, payload);
        setToast('¡Actualizado! El evento se guardó correctamente.');
      } else {
        await crearEvento(payload);
        setToast(`¡Agendado! Se agregó al día ${dia} de ${mesLabel}.`);
      }
      setShowNuevo(false);
      setEditandoId(null);
      setNuevoEvento({ titulo: '', ubicacion: '', descripcion: '', hora: '', dia: '1' });
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo guardar el evento.');
    }
  };

  return (
    <div>
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={irMesAnterior} aria-label="Mes anterior"><IconArrowLeft size={16} /></button>
          <h3 style={{ minWidth: 180, textAlign: 'center' }}>{mesLabel}</h3>
          <button className="btn btn-ghost btn-sm" onClick={irMesSiguiente} aria-label="Mes siguiente"><IconArrowRight size={16} /></button>
        </div>
        {isCoordinador && (
          <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Horario</button>
        )}
      </div>

      {error && <div className="empty-state">{error}</div>}

      <div className="calendar-grid">
        {DIAS.map((d) => <div className="calendar-day-name" key={d}>{d}</div>)}
        {celdas.map((dia, i) => (
          <div
            key={i}
            className={'calendar-cell' + (dia === null ? ' is-empty' : '')}
            onClick={() => {
              if (dia === null) return;
              const evs = eventosPorDia(dia);
              if (evs.length) setDiaSeleccionado(dia);
            }}
          >
            {dia !== null && (
              <>
                <span className="calendar-cell__num">{dia}</span>
                {eventosPorDia(dia).map((ev) => (
                  <span className="calendar-event" key={ev.id}>{ev.titulo} · {ev.hora}</span>
                ))}
              </>
            )}
          </div>
        ))}
      </div>

      {diaSeleccionado !== null && (
        <div className="eventos-del-dia" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {eventosPorDia(diaSeleccionado).map((ev) => {
            const asistencia = asistenciaPorEvento[ev.id];
            return (
              <div className="card card-pad event-detail-card" key={ev.id}>
                <h3 style={{ marginBottom: 6 }}>{ev.titulo}</h3>
                <p style={{ fontSize: 13, color: '#8c8272', marginBottom: 4 }}>
                  {diaSeleccionado} de {mesLabel} · {ev.hora}
                </p>
                {ev.ubicacion && (
                  <p style={{ fontSize: 14, marginTop: 12 }}><strong>Ubicación:</strong> {ev.ubicacion}</p>
                )}
                <p style={{ fontSize: 14, marginTop: 8 }}>
                  <strong>Descripción del evento:</strong> {ev.descripcion || 'Sin descripción adicional.'}
                </p>

                {isCoordinador ? (
                  <div className="attendance-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(ev)}>Editar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEliminarEvento(ev)}>Eliminar</button>
                  </div>
                ) : (
                  <div className="attendance-actions">
                    {asistencia ? (
                      <span className="badge badge-buen">{asistencia === 'si' ? 'Asistencia confirmada' : 'Inasistencia confirmada'}</span>
                    ) : (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => setConfirmando({ idEvento: ev.id, tipo: 'si' })}>Confirmar asistencia</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmando({ idEvento: ev.id, tipo: 'no' })}>No podré asistir</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmando && (
        <Modal
          title={confirmando.tipo === 'si' ? '¿Confirmar asistencia?' : '¿Confirmar inasistencia?'}
          onClose={() => setConfirmando(null)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => confirmar(confirmando.idEvento, confirmando.tipo)}>Confirmar</button>
            </>
          }
        >
          <p style={{ fontSize: 14, color: '#5c5347' }}>Esta acción quedará registrada para el coordinador del coro.</p>
        </Modal>
      )}

      {showNuevo && (
        <Modal
          title={editandoId ? 'Editar evento' : 'Nuevo evento'}
          onClose={() => setShowNuevo(false)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setShowNuevo(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAgregarEvento}>{editandoId ? 'Guardar' : 'Agregar'}</button>
            </>
          }
        >
          <div className="field">
            <label>Nombre del evento</label>
            <input placeholder="Ej. Ensayo general" maxLength={60} value={nuevoEvento.titulo} onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })} />
          </div>
          <div className="field">
            <label>Ubicación</label>
            <input placeholder="Ej. Salón parroquial" maxLength={100} value={nuevoEvento.ubicacion} onChange={(e) => setNuevoEvento({ ...nuevoEvento, ubicacion: e.target.value })} />
          </div>
          <div className="field">
            <label>Descripción del evento</label>
            <textarea rows={3} maxLength={300} placeholder="Ej. Ensayo de repertorio para la próxima celebración." value={nuevoEvento.descripcion} onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })} />
            <span className="field-hint">{nuevoEvento.descripcion.length}/300 caracteres</span>
          </div>
          <div className="field">
            <label>Día ({mesLabel})</label>
            <select value={nuevoEvento.dia} onChange={(e) => setNuevoEvento({ ...nuevoEvento, dia: e.target.value })}>
              {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {(() => {
              const evsDelDia = eventosPorDia(Number(nuevoEvento.dia)).filter((ev) => ev.id !== editandoId);
              return evsDelDia.length > 0 ? (
                <span className="field-hint">
                  Ya hay {evsDelDia.length} evento{evsDelDia.length > 1 ? 's' : ''} ese día: {evsDelDia.map((ev) => `${ev.titulo} (${ev.hora})`).join(', ')}
                </span>
              ) : (
                <span className="field-hint">No hay otros eventos agendados ese día.</span>
              );
            })()}
          </div>
          <div className="field">
            <label>Hora de inicio</label>
            <input type="time" value={nuevoEvento.hora} onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })} />
            <span className="field-hint">La hora de fin se registra automáticamente 1 hora después.</span>
          </div>
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
