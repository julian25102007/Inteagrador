import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCantos } from '../../context/CantosContext.jsx';
import { IconArrowLeft } from '../../components/Icons.jsx';

function renderLetraConAcordes(letra) {
  const partes = letra.split(/(\[[^\]]+\])/g);
  return partes.map((parte, i) =>
    /^\[[^\]]+\]$/.test(parte) ? (
      <span className="chord" key={i}>{parte.replace(/[[\]]/g, '')}</span>
    ) : (
      <React.Fragment key={i}>{parte}</React.Fragment>
    )
  );
}

export default function CantoDetail() {
  const { id } = useParams();
  const { detalles } = useCantos();
  const navigate = useNavigate();
  const canto = detalles[id];

  // Regresa a la página real de la que se vino (Lista, Esquema o Repertorio),
  // no siempre al Repertorio como pasaba antes.
  const volver = () => navigate(-1);

  if (!canto) {
    return (
      <div className="empty-state">
        <h3>Canto no encontrado</h3>
        <p>No hay letra y acordes cargados para este canto todavía.</p>
        <button type="button" onClick={volver} className="btn btn-ghost" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconArrowLeft size={16} /> Volver
        </button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={volver} className="btn btn-ghost btn-sm" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <IconArrowLeft size={16} /> Volver
      </button>

      <div className="canto-detail-card">
        <h2>{canto.titulo}</h2>
        <div className="canto-detail-meta">
          <span>Autor: <strong>{canto.autor}</strong></span>
          <span>T. Litúrgico: <strong>{canto.liturgico}</strong></span>
          <span>Momento: <strong>{canto.momento}</strong></span>
          <span>Dificultad: <strong>{canto.dificultad}</strong></span>
        </div>

        <div className="canto-detail-layout">
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Letra y acordes</h3>
            {canto.letra ? (
              <div className="canto-lyrics">{renderLetraConAcordes(canto.letra)}</div>
            ) : (
              <p style={{ fontSize: 13, color: '#8c8272' }}>Aún no se ha registrado la letra de este canto.</p>
            )}
          </div>
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Recursos</h3>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5c5347' }}>URL de YouTube</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input readOnly value={canto.youtube} style={{ flex: 1, border: '1px solid #e5dac2', borderRadius: 6, padding: '8px 10px', fontSize: 13 }} />
              <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(canto.youtube)}>Copiar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
