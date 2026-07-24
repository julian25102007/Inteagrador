import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCantos } from '../../context/CantosContext.jsx';
import { useListas } from '../../context/ListasContext.jsx';
import { IconArrowLeft, IconSearch } from '../../components/Icons.jsx';

function badgeClass(dificultad) {
  return { Baja: 'badge-baja', Media: 'badge-media', Alta: 'badge-alta' }[dificultad] || '';
}

export default function ListaDetail() {
  const { id } = useParams();
  const { listas } = useListas();
  const { cantos } = useCantos();
  const [busqueda, setBusqueda] = useState('');

  const lista = listas.find((l) => String(l.id) === id);

  const cantosDeLaLista = useMemo(() => {
    if (!lista) return [];
    const ids = lista.cantos || [];
    return cantos
      .filter((c) => ids.includes(c.id))
      .filter((c) => c.titulo.toLowerCase().includes(busqueda.toLowerCase()));
  }, [lista, cantos, busqueda]);

  if (!lista) {
    return (
      <div className="empty-state">
        <h3>Lista no encontrada</h3>
        <Link to="/cantos/listas" className="btn btn-ghost" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconArrowLeft size={16} /> Volver a listas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/cantos/listas" className="btn btn-ghost btn-sm" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <IconArrowLeft size={16} /> {lista.nombre}
      </Link>
      <p style={{ fontSize: 13.5, color: '#5c5347', marginBottom: 16 }}>{lista.descripcion}</p>

      <div className="page-toolbar">
        <div className="search-input">
          <IconSearch />
          <input placeholder="Buscar Canto" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>

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
            {cantosDeLaLista.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700 }}>
                  <Link to={`/cantos/${c.id}`}>{c.titulo}</Link>
                </td>
                <td>{c.autor}</td>
                <td>{c.liturgico}</td>
                <td>{c.momento}</td>
                <td><span className={`badge ${badgeClass(c.dificultad)}`}>{c.dificultad}</span></td>
                <td>
                  <Link to={`/cantos/${c.id}`} className="btn btn-ghost btn-sm">Ver letra</Link>
                </td>
              </tr>
            ))}
            {cantosDeLaLista.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state">Esta lista aún no tiene cantos agregados.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
