import React, { useState, useEffect } from 'react';
import { listarInventario, listarFinanzas, listarUsuarios, listarEventos, listarAsistencias } from '../../api/client';
import './Estadisticas.css';

const TABS = ['Inventario', 'Finanzas', 'Corista', 'Eventos'];

// Paleta sólida (sin degradados), un color por categoría
const PALETTE = ['#b38f4f', '#6b1e2f', '#4c7a52', '#2f5e91', '#a5432f'];

/* ---------- Gráfica de barras ---------- */
function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars-chart">
      {data.map((d, i) => (
        <div className="bars-chart__col" key={d.label}>
          <div
            className="bars-chart__bar"
            style={{ height: `${(d.value / max) * 180}px`, background: PALETTE[i % PALETTE.length] }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="bars-chart__value">{d.value}</span>
          <span className="bars-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Gráfica de pastel ---------- */
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function PieChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let angleAcc = 0;
  const cx = 90, cy = 90, r = 80;

  return (
    <div className="pie-chart">
      <svg viewBox="0 0 180 180" width="180" height="180">
        {data.map((d, i) => {
          const sweep = (d.value / total) * 360;
          const path = arcPath(cx, cy, r, angleAcc, angleAcc + sweep);
          angleAcc += sweep;
          return <path key={d.label} d={path} fill={PALETTE[i % PALETTE.length]} />;
        })}
      </svg>
      <ul className="pie-chart__legend">
        {data.map((d, i) => (
          <li key={d.label}>
            <span className="pie-chart__swatch" style={{ background: PALETTE[i % PALETTE.length] }} />
            {d.label} <strong>{d.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Histograma ---------- */
function Histogram({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="histogram-chart">
      {data.map((d) => (
        <div className="histogram-chart__col" key={d.label}>
          <div className="histogram-chart__bar" style={{ height: `${(d.value / max) * 180}px` }} title={`${d.label}: ${d.value}`} />
          <span className="histogram-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Gráfica lineal ---------- */
function LineChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = 480, height = 200;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - (d.value / max) * (height - 20) - 10;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <path d={linePath} fill="none" stroke="#b38f4f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => <circle key={p.label} cx={p.x} cy={p.y} r="4.5" fill="#6b1e2f" />)}
      </svg>
      <div className="line-chart__labels">
        {data.map((d) => <span key={d.label} className="line-chart__label">{d.label}</span>)}
      </div>
    </div>
  );
}

const CHART_TYPES = [
  { key: 'barras', label: 'Barras' },
  { key: 'pastel', label: 'Pastel' },
  { key: 'histograma', label: 'Histograma' },
  { key: 'linea', label: 'Línea' }
];

export default function Estadisticas() {
  const [tab, setTab] = useState('Inventario');
  const [chartType, setChartType] = useState('barras');
  const [datasets, setDatasets] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      listarInventario().catch(() => []),
      listarFinanzas().catch(() => []),
      listarUsuarios('Corista').catch(() => []),
      listarUsuarios('Coordinador').catch(() => []),
      listarAsistencias().catch(() => [])
    ])
      .then(([inventario, finanzas, coristas, coordinadores, asistencias]) => {
        const ingresos = finanzas.filter((f) => f.tipo === 'Ingreso').reduce((s, f) => s + Number(f.monto), 0);
        const egresos = finanzas.filter((f) => f.tipo === 'Egreso').reduce((s, f) => s + Number(f.monto), 0);
        const asistio = asistencias.filter((a) => a.asistira).length;
        const noAsistio = asistencias.length - asistio;

        setDatasets({
          Inventario: [
            { label: 'En buen estado', value: inventario.filter((i) => i.estado === 'En buen estado').length },
            { label: 'En mal estado', value: inventario.filter((i) => i.estado === 'En mal estado').length },
            { label: 'En uso', value: inventario.filter((i) => i.estado === 'En uso').length }
          ],
          Finanzas: [
            { label: 'Ingresos', value: Math.round(ingresos) },
            { label: 'Egresos', value: Math.round(egresos) },
            { label: 'Balance', value: Math.round(ingresos - egresos) }
          ],
          Corista: [
            { label: 'Coristas', value: coristas.length },
            { label: 'Coordinadores', value: coordinadores.length },
            { label: 'Total miembros', value: coristas.length + coordinadores.length }
          ],
          Eventos: [
            { label: 'Asistió', value: asistio },
            { label: 'No asistió', value: noAsistio }
          ]
        });
      })
      .catch((err) => setError(err.message || 'No se pudieron cargar las estadísticas.'));
  }, []);

  const data = datasets?.[tab] || [];

  return (
    <div>
      <div className="cantos-tabs">
        {TABS.map((t) => (
          <button key={t} className={'cantos-tab' + (tab === t ? ' is-active' : '')} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card card-pad">
        {error && <div className="empty-state">{error}</div>}

        {!error && (
          <>
            <div className="chart-type-tabs">
              {CHART_TYPES.map((c) => (
                <button key={c.key} className={'chart-type-tab' + (chartType === c.key ? ' is-active' : '')} onClick={() => setChartType(c.key)}>
                  {c.label}
                </button>
              ))}
            </div>

            <h3 style={{ margin: '20px 0' }}>{tab}</h3>

            {!datasets ? (
              <p style={{ fontSize: 13, color: '#8c8272' }}>Cargando estadísticas…</p>
            ) : (
              <>
                {chartType === 'barras' && <BarChart data={data} />}
                {chartType === 'pastel' && <PieChart data={data} />}
                {chartType === 'histograma' && <Histogram data={data} />}
                {chartType === 'linea' && <LineChart data={data} />}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
