import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarEventos } from '../../api/client';
import { IconPublicaciones, IconHorario } from '../../components/Icons.jsx';
import WelcomeBanner from '../../components/WelcomeBanner.jsx';
import './Home.css';

const NOMBRES_MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function formatearFecha(fechaIso, hora) {
  const [y, m, d] = fechaIso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  const horaFmt = hora ? new Date(`1970-01-01T${hora}`).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' }) : '';
  return `${DIAS[fecha.getDay()]} ${d} ${NOMBRES_MESES[m - 1]}${horaFmt ? ' · ' + horaFmt : ''}`;
}

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listarEventos()
      .then((data) => {
        const hoyStr = new Date().toISOString().slice(0, 10);
        const proximos = data
          .filter((e) => e.fecha >= hoyStr)
          .sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio))
          .slice(0, 5)
          .map((e) => ({
            id: e.idEvento,
            titulo: e.nombre,
            fecha: formatearFecha(e.fecha, e.horaInicio)
          }));
        setEventos(proximos);
      })
      .catch((err) => setError(err.message || 'No se pudieron cargar los próximos eventos.'));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <WelcomeBanner />
      </div>

      <div className="home-grid">
        <section className="card card-pad">
          <h3 style={{ marginBottom: 16 }}>Próximos eventos</h3>
          {error && <p className="empty-state">{error}</p>}
          <ul className="event-list">
            {eventos.map((ev) => (
              <li key={ev.id} className="event-list__item">
                <span className="event-list__dot" />
                <div>
                  <div className="event-list__title">{ev.titulo}</div>
                  <div className="event-list__date">{ev.fecha}</div>
                </div>
              </li>
            ))}
            {!error && eventos.length === 0 && (
              <li style={{ fontSize: 13, color: '#8c8272' }}>No hay eventos próximos agendados.</li>
            )}
          </ul>
          <Link to="/horario" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
            Ver todos los eventos
          </Link>
        </section>

        <section className="card card-pad">
          <h3 style={{ marginBottom: 16 }}>Accesos rápidos</h3>
          <div className="quick-links">
            <Link to="/publicaciones" className="quick-link"><IconPublicaciones size={18} /> Publicaciones</Link>
            <Link to="/horario" className="quick-link"><IconHorario size={18} /> Ver horarios</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
