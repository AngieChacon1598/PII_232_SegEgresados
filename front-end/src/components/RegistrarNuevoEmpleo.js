import React, { useState, useEffect } from 'react';
import { getEgresados, registrarNuevoEmpleo } from '../services/api';

const initialForm = {
  codigo_egresado: '',
  fecha_egreso: '',
  empresa_actual: '',
  cargo_actual: '',
  pais_residencia: '',
  ciudad_residencia: '',
  fecha_incorporacion: '',
  area_trabajo: '',
  sueldo_actual: ''
};

const RegistrarNuevoEmpleo = () => {
  const [egresados, setEgresados] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEgresados = async () => {
      try {
        const res = await getEgresados('A');
        setEgresados(Array.isArray(res.data) ? res.data : res.data.egresados || []);
      } catch (err) {
        setMessage('Error al cargar egresados');
      }
    };
    fetchEgresados();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = { ...form };
      delete payload.codigo_egresado;
      payload.sueldo_actual = parseFloat(payload.sueldo_actual);
      const res = await registrarNuevoEmpleo(form.codigo_egresado, payload);
      setMessage(res.data.message || 'Nuevo empleo registrado exitosamente');
      setForm(initialForm);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error al registrar el nuevo empleo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Registrar Nuevo Empleo para Egresado</h2>
      {message && <div style={{ marginBottom: 16, color: message.includes('exitosamente') ? 'green' : 'red' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Egresado: *</label>
          <select name="codigo_egresado" value={form.codigo_egresado} onChange={handleChange} required>
            <option value="">Seleccione un egresado</option>
            {Array.isArray(egresados) && egresados.map(e => (
              <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.nombre} {e.apellidos}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Fecha de Egreso: *</label>
          <input type="date" name="fecha_egreso" value={form.fecha_egreso} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Empresa Actual: *</label>
          <input type="text" name="empresa_actual" value={form.empresa_actual} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Cargo Actual: *</label>
          <input type="text" name="cargo_actual" value={form.cargo_actual} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>País de Residencia: *</label>
          <input type="text" name="pais_residencia" value={form.pais_residencia} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Ciudad de Residencia: *</label>
          <input type="text" name="ciudad_residencia" value={form.ciudad_residencia} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Fecha de Incorporación: *</label>
          <input type="date" name="fecha_incorporacion" value={form.fecha_incorporacion} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Área de Trabajo: *</label>
          <input type="text" name="area_trabajo" value={form.area_trabajo} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Sueldo Actual: *</label>
          <input type="number" name="sueldo_actual" value={form.sueldo_actual} onChange={handleChange} required min="0" step="0.01" />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar Nuevo Empleo'}</button>
      </form>
    </div>
  );
};

export default RegistrarNuevoEmpleo; 