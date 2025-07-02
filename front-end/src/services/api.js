import axios from 'axios';

// Configuración para desarrollo y producción
const isDevelopment = process.env.NODE_ENV === 'development';
const BASE_URL = isDevelopment 
  ? 'http://localhost:5001' 
  : 'https://pii-232-segegresados-api.onrender.com';

// URLs base para todas las APIs
const API_URL = `${BASE_URL}/egresados`;
const DETALLE_API_URL = `${BASE_URL}/detalle-egresados`;
const EMPRESAS_API_URL = `${BASE_URL}/empresas`;
const CERTIFICACIONES_API_URL = `${BASE_URL}/certificaciones`;
const CARRERAS_API_URL = `${BASE_URL}/carreras`;
const REPORTES_API_URL = `${BASE_URL}/api/reportes`;
const ENCUESTAS_API_URL = `${BASE_URL}/api/encuestas`;

// Función para obtener todos los egresados
export const getEgresados = (params) => {
  return axios.get(API_URL + "?" + params.toString());
};

// Función para agregar un nuevo egresado
export const addEgresado = (egresado) => {
  return axios.post(API_URL, egresado);
};

// Función para eliminar un egresado
export const deleteEgresado = (codigo) => {
  console.log("Llamando deleteEgresado a:", `${API_URL}/${codigo}`);
  return axios.delete(`${API_URL}/${codigo}`);
};
  
// Función para restaurar un egresado
export const restoreEgresado = (codigo) => {
  return axios.put(`${API_URL}/${codigo}/restaurar`);
};

// Función para actualizar un egresado
export const updateEgresado = (codigo, egresado) => {
  return axios.put(`${API_URL}/${codigo}`, egresado);
};

// ========================================
// FUNCIONES PARA DETALLE_EGRESADO
// ========================================

// Función para obtener todos los detalles de egresados
export const getDetalleEgresados = (estado, codigoEgresado, page = 1, per_page = 10) => {
  let url = DETALLE_API_URL;
  const params = new URLSearchParams();
  if (estado) params.append('estado', estado);
  if (codigoEgresado) params.append('codigo_egresado', codigoEgresado);
  if (page) params.append('page', page);
  if (per_page) params.append('per_page', per_page);
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  return axios.get(url);
};

// Función para obtener un detalle específico
export const getDetalleEgresado = (idDetalle) => {
  return axios.get(`${DETALLE_API_URL}/${idDetalle}`);
};

// Función para agregar un nuevo detalle de egresado
export const addDetalleEgresado = (detalle) => {
  return axios.post(DETALLE_API_URL, detalle);
};

// Función para actualizar un detalle de egresado
export const updateDetalleEgresado = (idDetalle, detalle) => {
  return axios.put(`${DETALLE_API_URL}/${idDetalle}`, detalle);
};

// Función para eliminar lógicamente un detalle de egresado
export const deleteDetalleEgresado = (idDetalle) => {
  return axios.delete(`${DETALLE_API_URL}/${idDetalle}`);
};

// Función para restaurar un detalle de egresado
export const restoreDetalleEgresado = (idDetalle) => {
  return axios.put(`${DETALLE_API_URL}/restaurar/${idDetalle}`);
};

// Función para eliminar físicamente un detalle de egresado
export const deleteDetalleEgresadoFisico = (idDetalle) => {
  return axios.delete(`${DETALLE_API_URL}/fisico/${idDetalle}`);
};

// ========================================
// FUNCIONES PARA EMPRESAS
// ========================================

export const getEmpresas = (estado, page = 1, per_page = 10, search = '') => {
  const params = new URLSearchParams();
  if (estado) params.append('estado', estado);
  if (page) params.append('page', page);
  if (per_page) params.append('per_page', per_page);
  if (search) params.append('search', search);
  
  return axios.get(`${EMPRESAS_API_URL}?${params}`);
};

export const getEmpresa = (id) => {
  return axios.get(`${EMPRESAS_API_URL}/${id}`);
};

export const addEmpresa = (empresa) => {
  return axios.post(EMPRESAS_API_URL, empresa);
};

export const updateEmpresa = (id, empresa) => {
  return axios.put(`${EMPRESAS_API_URL}/${id}`, empresa);
};

export const deleteEmpresa = (id) => {
  return axios.delete(`${EMPRESAS_API_URL}/${id}`);
};

export const restoreEmpresa = (id) => {
  return axios.put(`${EMPRESAS_API_URL}/restaurar/${id}`);
};

// ========================================
// FUNCIONES PARA CERTIFICACIONES
// ========================================

export const getCertificaciones = (codigo_egresado) => {
  const params = codigo_egresado ? `?codigo_egresado=${codigo_egresado}` : '';
  return axios.get(`${CERTIFICACIONES_API_URL}${params}`);
};

export const addCertificacion = (certificacion) => {
  return axios.post(CERTIFICACIONES_API_URL, certificacion);
};

export const updateCertificacion = (id, certificacion) => {
  return axios.put(`${CERTIFICACIONES_API_URL}/${id}`, certificacion);
};

export const deleteCertificacion = (id) => {
  return axios.delete(`${CERTIFICACIONES_API_URL}/${id}`);
};

export const downloadCertificacion = (id) => {
  return `${CERTIFICACIONES_API_URL}/${id}/archivo`;
};

// ========================================
// FUNCIONES PARA CARRERAS
// ========================================

export const getCarreras = () => {
  return axios.get(CARRERAS_API_URL);
};

// ========================================
// FUNCIONES PARA REPORTES
// ========================================

export const getReporteEgresadosPorCarrera = () => {
  return axios.get(`${REPORTES_API_URL}/egresados-por-carrera`);
};

export const getReporteEgresadosPorEstado = () => {
  return axios.get(`${REPORTES_API_URL}/egresados-por-estado`);
};

export const getReporteEgresadosPorAnio = () => {
  return axios.get(`${REPORTES_API_URL}/egresados-por-anio`);
};

export const getConfiguracionReportes = () => {
  return axios.get(`${REPORTES_API_URL}/configuracion`);
};

export const updateConfiguracionReportes = (config) => {
  return axios.put(`${REPORTES_API_URL}/configuracion`, config);
};

export const enviarReporteManual = (data) => {
  return axios.post(`${REPORTES_API_URL}/enviar-manual`, data);
};

export const getVistaPreviaReporte = (tipo) => {
  return axios.get(`${REPORTES_API_URL}/vista-previa?tipo=${tipo}`);
};

export const getEstadisticasReportes = () => {
  return axios.get(`${REPORTES_API_URL}/estadisticas`);
};

// ========================================
// FUNCIONES PARA ENCUESTAS
// ========================================

export const enviarEncuesta = (data) => {
  return fetch(ENCUESTAS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
};

// ========================================
// FUNCIONES PARA NUEVO EMPLEO
// ========================================

export const registrarNuevoEmpleo = (codigo, data) => {
  return axios.post(`${API_URL}/${codigo}/nuevo-empleo`, data);
};

// ========================================
// FUNCIONES PARA ESTADÍSTICAS
// ========================================

export const getEstadisticas = () => {
  return Promise.all([
    axios.get(`${API_URL}?per_page=1000`),
    axios.get(`${DETALLE_API_URL}?per_page=1000`),
    axios.get(CERTIFICACIONES_API_URL),
    axios.get(EMPRESAS_API_URL)
  ]);
};
