import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listarFinanzas, crearFinanza, actualizarFinanza, eliminarFinanzaApi } from '../../api/client';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';

const fmt = (n) => `$${Number(n).toLocaleString('es-MX')}`;

// El backend guarda el tipo en singular ('Ingreso'/'Egreso'); la interfaz
// usa las pestañas en plural, aquí traducimos entre ambos.
const tabATipo = (tab) => (tab === 'Ingresos' ? 'Ingreso' : 'Egreso');
const tipoATab = (tipo) => (tipo === 'Ingreso' ? 'Ingresos' : 'Egresos');

export default function Finanzas() {
  const { isCoordinador, user } = useAuth();

  const [tab, setTab] = useState('Ingresos');
  const [showNuevo, setShowNuevo] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ fecha: '', concepto: '', monto: '' });
  const [todosMovimientos, setTodosMovimientos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    setCargando(true);
    listarFinanzas()
      .then((data) => setTodosMovimientos(data.map((f) => ({
        id: f.idFinanza, tipo: tipoATab(f.tipo), fecha: f.fecha, concepto: f.concepto, monto: Number(f.monto)
      }))))
      .catch((err) => setError(err.message || 'No se pudieron cargar las finanzas.'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const movimientos = todosMovimientos.filter((m) => m.tipo === tab);
  const totalIngresos = todosMovimientos.filter((m) => m.tipo === 'Ingresos').reduce((s, m) => s + m.monto, 0);
  const totalEgresos = todosMovimientos.filter((m) => m.tipo === 'Egresos').reduce((s, m) => s + m.monto, 0);
  const balance = totalIngresos - totalEgresos;

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm({ fecha: '', concepto: '', monto: '' });
    setShowNuevo(true);
  };

  const abrirEditar = (m) => {
    setEditandoId(m.id);
    setForm({ fecha: m.fecha, concepto: m.concepto, monto: String(m.monto) });
    setShowNuevo(true);
  };

  const handleAgregar = async () => {
    if (!form.fecha) {
      setToast('La fecha es obligatoria.');
      return;
    }
    if (!form.concepto.trim()) {
      setToast('El concepto es obligatorio.');
      return;
    }
    if (!form.monto) {
      setToast('El monto es obligatorio.');
      return;
    }
    const montoNum = Number(form.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setToast('El monto debe ser un número mayor a 0.');
      return;
    }
    try {
      if (editandoId) {
        await actualizarFinanza(editandoId, {
          tipo: tabATipo(tab), fecha: form.fecha, concepto: form.concepto, monto: montoNum
        });
        setToast(`¡Actualizado! El ${tab === 'Ingresos' ? 'ingreso' : 'egreso'} se guardó correctamente.`);
      } else {
        await crearFinanza({
          tipo: tabATipo(tab), fecha: form.fecha, concepto: form.concepto, monto: montoNum,
          idUsuario: user?.idUsuario
        });
        setToast(`¡Agregado exitoso! Tu ${tab === 'Ingresos' ? 'ingreso' : 'egreso'} ha sido registrado correctamente.`);
      }
      setShowNuevo(false);
      setEditandoId(null);
      setForm({ fecha: '', concepto: '', monto: '' });
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo guardar el movimiento.');
    }
  };

  const handleEliminar = async (m) => {
    try {
      await eliminarFinanzaApi(m.id);
      setEliminando(null);
      setToast(`${m.tipo === 'Ingresos' ? 'Ingreso' : 'Egreso'} eliminado.`);
      cargar();
    } catch (err) {
      setToast(err.message || 'No se pudo eliminar el movimiento.');
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__label">Total de ingresos</span>
          <span className="stat-card__value positive">{fmt(totalIngresos)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Total de egresos</span>
          <span className="stat-card__value negative">{fmt(totalEgresos)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Balance</span>
          <span className="stat-card__value">{fmt(balance)}</span>
        </div>
      </div>

      {error && <div className="empty-state">{error}</div>}

      <div className="page-toolbar">
        <div className="cantos-tabs" style={{ marginBottom: 0, border: 'none' }}>
          <button className={'cantos-tab' + (tab === 'Ingresos' ? ' is-active' : '')} onClick={() => setTab('Ingresos')}>Ingresos</button>
          <button className={'cantos-tab' + (tab === 'Egresos' ? ' is-active' : '')} onClick={() => setTab('Egresos')}>Egresos</button>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          + Nuevo {tab === 'Ingresos' ? 'Ingreso' : 'Egreso'}
        </button>
      </div>

      <div className="table-wrap">
        <table className="evan-table">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th><th>Acciones</th></tr></thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id}>
                <td>{m.fecha}</td>
                <td>{m.tipo}</td>
                <td>{m.concepto}</td>
                <td style={{ fontWeight: 700 }}>{fmt(m.monto)}</td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {isCoordinador && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(m)}>Editar</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEliminando(m)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!cargando && movimientos.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state">Sin movimientos registrados este mes.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showNuevo && (
        <Modal
          title={editandoId ? `Editar ${tab === 'Ingresos' ? 'ingreso' : 'egreso'}` : `Nuevo ${tab === 'Ingresos' ? 'ingreso' : 'egreso'}`}
          onClose={() => setShowNuevo(false)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setShowNuevo(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAgregar}>{editandoId ? 'Guardar' : 'Agregar'}</button>
            </>
          }
        >
          <div className="field"><label>Fecha</label><input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></div>
          <div className="field"><label>Concepto</label><input maxLength={80} value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} /></div>
          <div className="field"><label>Monto</label><input type="number" min="0.01" step="0.01" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></div>
        </Modal>
      )}

      {eliminando && (
        <Modal
          title="Eliminar movimiento"
          onClose={() => setEliminando(null)}
          actions={
            <>
              <button className="btn btn-ghost" onClick={() => setEliminando(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleEliminar(eliminando)}>Eliminar</button>
            </>
          }
        >
          <p>¿Estás seguro que quieres eliminar este movimiento?</p>
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
