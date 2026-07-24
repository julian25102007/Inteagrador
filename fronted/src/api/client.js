// Cliente central para hablar con el backend Javalin.
// La URL del backend se toma de una variable de entorno de Vite (VITE_API_URL),
// NUNCA se escribe fija en el código: así en local usas localhost y en AWS
// usas el dominio/IP real sin tocar el código fuente.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TOKEN_KEY = 'evansong_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  // El backend a veces responde texto plano en errores (ctx.result(...))
  // y JSON en éxito (ctx.json(...)); manejamos ambos casos.
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    const mensaje = (data && data.mensaje) || data || `Error ${res.status}`;
    const error = new Error(typeof mensaje === 'string' ? mensaje : 'Error de red');
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' })
};

// --- Auth ---
export async function loginRequest(correo, contrasena) {
  return api.post('/auth/login', { correo, contrasena }, { auth: false });
}

export async function registroRequest(datos) {
  return api.post('/auth/registro', datos, { auth: false });
}

export async function meRequest() {
  return api.get('/auth/me');
}

// --- Whitelist de correos de coordinador (solo rol Coordinador) ---
export async function listarCorreosCoordinador() {
  return api.get('/correos-coordinador');
}

export async function invitarCorreoCoordinador(correo) {
  return api.post('/correos-coordinador', { correo });
}

export async function eliminarCorreoCoordinador(idCorreo) {
  return api.del(`/correos-coordinador/${idCorreo}`);
}

// --- Usuarios (coristas / coordinadores) ---
export async function listarUsuarios(rol) {
  return api.get(rol ? `/usuarios?rol=${encodeURIComponent(rol)}` : '/usuarios');
}

export async function actualizarPerfil(id, datos) {
  return api.put(`/usuarios/${id}`, datos);
}

// --- Catálogos (tiempos litúrgicos y momentos de misa) ---
export const listarTiempos = () => api.get('/tiempos-liturgicos');
export const listarMomentos = () => api.get('/momentos-misa');

// --- Cantos ---
export const listarCantos = () => api.get('/cantos');
export const crearCanto = (datos) => api.post('/cantos', datos);
export const actualizarCanto = (id, datos) => api.put(`/cantos/${id}`, datos);
export const eliminarCantoApi = (id) => api.del(`/cantos/${id}`);

// --- Listas y su relación con cantos ---
export const listarListas = () => api.get('/listas');
export const crearLista = (datos) => api.post('/listas', datos);
export const actualizarLista = (id, datos) => api.put(`/listas/${id}`, datos);
export const eliminarListaApi = (id) => api.del(`/listas/${id}`);
export const listarCantosDeLista = (idLista) => api.get(`/lista-canto/lista/${idLista}`);
export const agregarCantoALista = (idLista, idCanto) => api.post('/lista-canto', { idLista, idCanto });
export const quitarCantoDeListaApi = (idLista, idCanto) => api.del(`/lista-canto/${idLista}/${idCanto}`);

// --- Esquemas litúrgicos y su detalle ---
export const listarEsquemas = () => api.get('/esquemas');
export const crearEsquema = (datos) => api.post('/esquemas', datos);
export const actualizarEsquema = (id, datos) => api.put(`/esquemas/${id}`, datos);
export const eliminarEsquemaApi = (id) => api.del(`/esquemas/${id}`);
export const listarDetalleEsquema = () => api.get('/detalle-esquema');
export const crearDetalleEsquema = (datos) => api.post('/detalle-esquema', datos);
export const eliminarDetalleEsquemaApi = (id) => api.del(`/detalle-esquema/${id}`);

// --- Inventario ---
export const listarInventario = () => api.get('/inventario');
export const crearInventario = (datos) => api.post('/inventario', datos);
export const actualizarInventario = (id, datos) => api.put(`/inventario/${id}`, datos);
export const eliminarInventarioApi = (id) => api.del(`/inventario/${id}`);

// --- Finanzas ---
export const listarFinanzas = () => api.get('/finanzas');
export const crearFinanza = (datos) => api.post('/finanzas', datos);
export const actualizarFinanza = (id, datos) => api.put(`/finanzas/${id}`, datos);
export const eliminarFinanzaApi = (id) => api.del(`/finanzas/${id}`);

// --- Publicaciones ---
export const listarPublicaciones = () => api.get('/publicaciones');
export const crearPublicacion = (datos) => api.post('/publicaciones', datos);
export const actualizarPublicacion = (id, datos) => api.put(`/publicaciones/${id}`, datos);
export const eliminarPublicacionApi = (id) => api.del(`/publicaciones/${id}`);

// --- Asistencias ---
export const listarAsistencias = () => api.get('/asistencias');
export const listarAsistenciasPorEvento = (idEvento) => api.get(`/asistencias/evento/${idEvento}`);
export const listarAsistenciasPorUsuario = (idUsuario) => api.get(`/asistencias/usuario/${idUsuario}`);
export const registrarAsistencia = (datos) => api.post('/asistencias', datos);

// --- Eventos ---
export const listarEventos = () => api.get('/eventos');
export const crearEvento = (datos) => api.post('/eventos', datos);
export const actualizarEvento = (id, datos) => api.put(`/eventos/${id}`, datos);
export const eliminarEventoApi = (id) => api.del(`/eventos/${id}`);
