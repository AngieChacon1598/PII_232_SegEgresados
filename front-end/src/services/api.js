import axios from 'axios';

const API_URL = 'http://localhost:5001/egresados';
const DETALLE_API_URL = 'http://localhost:5001/detalle-egresados';

// Función para obtener todos los egresados
export const getEgresados = (estado) => {
  return axios.get(`${API_URL}?estado=${estado}`);
};

// Función para agregar un nuevo egresado
export const addEgresado = (egresado) => {
  return axios.post(API_URL, egresado);
};

// Función para eliminar un egresado
export const deleteEgresado = (codigo) => {
  return axios.delete(`${API_URL}/${codigo}`);
};

// Función para restaurar un egresado
export const restoreEgresado = (codigo) => {
  return axios.put(`${API_URL}/restaurar/${codigo}`);
};

// ========================================
// FUNCIONES PARA DETALLE_EGRESADO
// ========================================

// Función para obtener todos los detalles de egresados
export const getDetalleEgresados = (estado, codigoEgresado) => {
  let url = DETALLE_API_URL;
  const params = new URLSearchParams();
  
  if (estado) params.append('estado', estado);
  if (codigoEgresado) params.append('codigo_egresado', codigoEgresado);
  
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
