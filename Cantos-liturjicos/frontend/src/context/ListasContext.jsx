import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  listarListas, crearLista, actualizarLista, eliminarListaApi,
  listarCantosDeLista, agregarCantoALista, quitarCantoDeListaApi
} from '../api/client';

const ListasContext = createContext(null);

export function ListasProvider({ children }) {
  const { user } = useAuth();
  const [listas, setListas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const base = await listarListas();
      // Por cada lista traemos sus cantos para saber el total y los ids asociados.
      const conCantos = await Promise.all(
        base.map(async (l) => {
          const filas = await listarCantosDeLista(l.idLista).catch(() => []);
          return {
            id: l.idLista,
            nombre: l.nombre,
            descripcion: l.descripcion,
            total: filas.length,
            cantos: filas.map((f) => f.idCanto)
          };
        })
      );
      setListas(conCantos);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las listas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const agregarLista = async (datos) => {
    const nueva = await crearLista({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      idUsuario: user?.idUsuario
    });
    for (const idCanto of datos.cantos || []) {
      await agregarCantoALista(nueva.idLista, idCanto);
    }
    await cargar();
  };

  const editarLista = async (id, datos) => {
    await actualizarLista(id, { nombre: datos.nombre, descripcion: datos.descripcion });

    // Sincroniza los cantos: comparamos lo que ya estaba con lo nuevo.
    const actual = listas.find((l) => l.id === id);
    const antes = new Set(actual?.cantos || []);
    const despues = new Set(datos.cantos || []);

    for (const idCanto of antes) {
      if (!despues.has(idCanto)) await quitarCantoDeListaApi(id, idCanto);
    }
    for (const idCanto of despues) {
      if (!antes.has(idCanto)) await agregarCantoALista(id, idCanto);
    }
    await cargar();
  };

  const eliminarLista = async (id) => {
    await eliminarListaApi(id);
    await cargar();
  };

  return (
    <ListasContext.Provider value={{ listas, cargando, error, agregarLista, editarLista, eliminarLista, recargar: cargar }}>
      {children}
    </ListasContext.Provider>
  );
}

export function useListas() {
  return useContext(ListasContext);
}
