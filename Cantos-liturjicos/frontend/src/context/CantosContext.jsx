import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  listarCantos, crearCanto, actualizarCanto, eliminarCantoApi,
  listarTiempos, listarMomentos
} from '../api/client';

const CantosContext = createContext(null);

// Convierte el canto que devuelve el backend (con idTiempo/idMomento numéricos)
// a la forma que ya usaba la interfaz (con los nombres "liturgico"/"momento" en texto).
function mapearCanto(c, tiemposPorId, momentosPorId) {
  return {
    id: c.idCanto,
    titulo: c.titulo,
    autor: c.autor,
    idTiempo: c.idTiempo,
    idMomento: c.idMomento,
    liturgico: tiemposPorId[c.idTiempo] || '',
    momento: momentosPorId[c.idMomento] || '',
    dificultad: c.dificultad,
    letra: c.letra || '',
    youtube: c.urlYoutube || ''
  };
}

export function CantosProvider({ children }) {
  const [cantos, setCantos] = useState([]);
  const [tiempos, setTiempos] = useState([]); // [{idTiempo, nombre}]
  const [momentos, setMomentos] = useState([]); // [{idMomento, nombre}]
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [cantosRes, tiemposRes, momentosRes] = await Promise.all([
        listarCantos(), listarTiempos(), listarMomentos()
      ]);
      setTiempos(tiemposRes);
      setMomentos(momentosRes);
      const tiemposPorId = Object.fromEntries(tiemposRes.map((t) => [t.idTiempo, t.nombre]));
      const momentosPorId = Object.fromEntries(momentosRes.map((m) => [m.idMomento, m.nombre]));
      setCantos(cantosRes.map((c) => mapearCanto(c, tiemposPorId, momentosPorId)));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los cantos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // "detalles" existe por compatibilidad con CantoDetail.jsx, que espera un
  // diccionario id -> canto completo (incluyendo letra y youtube).
  const detalles = Object.fromEntries(cantos.map((c) => [c.id, c]));

  const idTiempoPorNombre = (nombre) => tiempos.find((t) => t.nombre === nombre)?.idTiempo || null;
  const idMomentoPorNombre = (nombre) => momentos.find((m) => m.nombre === nombre)?.idMomento || null;

  const agregarCanto = async (datos) => {
    const payload = {
      titulo: datos.titulo,
      autor: datos.autor,
      idTiempo: idTiempoPorNombre(datos.liturgico),
      idMomento: idMomentoPorNombre(datos.momento),
      dificultad: datos.dificultad,
      letra: datos.letra || '',
      urlYoutube: datos.youtube || ''
    };
    const creado = await crearCanto(payload);
    await cargar();
    return creado.idCanto;
  };

  const editarCanto = async (id, datos) => {
    const payload = {
      titulo: datos.titulo,
      autor: datos.autor,
      idTiempo: idTiempoPorNombre(datos.liturgico),
      idMomento: idMomentoPorNombre(datos.momento),
      dificultad: datos.dificultad,
      letra: datos.letra ?? '',
      urlYoutube: datos.youtube ?? ''
    };
    await actualizarCanto(id, payload);
    await cargar();
  };

  const eliminarCanto = async (id) => {
    await eliminarCantoApi(id);
    await cargar();
  };

  return (
    <CantosContext.Provider value={{
      cantos, detalles, tiempos, momentos, cargando, error,
      agregarCanto, editarCanto, eliminarCanto, recargar: cargar
    }}>
      {children}
    </CantosContext.Provider>
  );
}

export function useCantos() {
  return useContext(CantosContext);
}
