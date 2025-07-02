import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Empresa.css';

function EmpresaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      axios.get(`http://localhost:5001/empresas/${id}`)
        .then(res => setForm(res.data))
        .catch(() => setError('No se pudo cargar la empresa'));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await axios.put(`http://localhost:5001/empresas/${id}`, form);
      } else {
        await axios.post('http://localhost:5001/empresas', form);
      }
      navigate('/empresas');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  return (
    <div className="empresa-form">
      <h2>{isEdit ? 'Editar Empresa' : 'Registrar Empresa'}</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div>
          <label>Nombre:</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div>
          <label>RUC:</label>
          <input name="ruc" value={form.ruc} onChange={handleChange} required maxLength={11} minLength={11} />
        </div>
        <div>
          <label>Dirección:</label>
          <input name="direccion" value={form.direccion} onChange={handleChange} />
        </div>
        <div>
          <label>Teléfono:</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </div>
        <div>
          <label>Correo:</label>
          <input name="correo" value={form.correo} onChange={handleChange} />
        </div>
        <button type="submit" style={{ marginTop: 12, background: '#1976d2', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none' }}>
          {isEdit ? 'Actualizar' : 'Registrar'}
        </button>
        <button type="button" onClick={() => navigate('/empresas')} style={{ marginLeft: 8, marginTop: 12 }}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default EmpresaForm; 