import React, { useState, useEffect } from 'react';
import { listarUsuarios, listarAsistencias } from '../../api/client';
import { IconSearch } from '../../components/Icons.jsx';

export default function Coristas() {
  const [busqueda, setBusqueda] = useState('');
  const [coristas, setCoristas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([listarUsuarios('Corista'), listarAsistencias()])
      .then(([usuarios, asis]) => {
        setCoristas(usuarios);
        setAsistencias(asis);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar la lista de coristas.'))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = coristas.filter((c) =>
    (c.nombreCompleto || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const conteoDe = (idUsuario) => {
    const propias = asistencias.filter((a) => a.idUsuario === idUsuario);
    const asistio = propias.filter((a) => a.asistira).length;
    const noAsistio = propias.length - asistio;
    return { asistio, noAsistio };
  };

  return (
    <div>
      <div className="page-toolbar">
        <div className="search-input">
          <IconSearch />
          <input placeholder="Buscar Coristas" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>

      {error && <div className="empty-state">{error}</div>}

      <div className="table-wrap">
        <table className="evan-table">
          <thead><tr><th>Nombre</th><th>Teléfono</th><th>Fecha Ingreso</th><th>Asistencias</th><th>No asistió</th></tr></thead>
          <tbody>
            {filtrados.map((c) => {
              const { asistio, noAsistio } = conteoDe(c.idUsuario);
              return (
                <tr key={c.idUsuario}>
                  <td style={{ fontWeight: 700 }}>{c.nombreCompleto}</td>
                  <td>{c.telefono || '—'}</td>
                  <td>{c.fechaRegistro ? c.fechaRegistro.split('T')[0] : '—'}</td>
                  <td><span className="badge badge-baja">{asistio}</span></td>
                  <td><span className="badge badge-alta">{noAsistio}</span></td>
                </tr>
              );
            })}
            {!cargando && filtrados.length === 0 && !error && (
              <tr><td colSpan={5}><div className="empty-state">No hay coristas con ese nombre.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
