import React, { useState } from 'react';
import { updateCertificacion, addCertificacion } from '../services/api';
import './CertificacionForm.css';

function CertificacionForm({ egresado, certificacion, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    nombre: certificacion?.nombre || '',
    institucion: certificacion?.institucion || '',
    fecha_obtencion: certificacion?.fecha_obtencion ? certificacion.fecha_obtencion.substring(0, 10) : '',
    archivo: null,
    estado: certificacion?.estado || 'A',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const validate = () => {
    const errors = {};
    // Solo letras y espacios para nombre e institución
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
    if (!form.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    } else if (!nameRegex.test(form.nombre.trim())) {
      errors.nombre = 'El nombre solo debe contener letras y espacios';
    }
    if (!form.institucion.trim()) {
      errors.institucion = 'La institución es obligatoria';
    } else if (!nameRegex.test(form.institucion.trim())) {
      errors.institucion = 'La institución solo debe contener letras y espacios';
    }
    // Fecha lógica
    if (!form.fecha_obtencion) {
      errors.fecha_obtencion = 'La fecha de obtención es obligatoria';
    } else {
      const fecha = new Date(form.fecha_obtencion);
      const hoy = new Date();
      hoy.setHours(0,0,0,0);
      if (fecha > hoy) {
        errors.fecha_obtencion = 'La fecha de obtención no puede ser futura';
      }
    }
    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }
    const data = new FormData();
    data.append('codigo_egresado', egresado.codigo);
    data.append('nombre', form.nombre);
    data.append('institucion', form.institucion);
    data.append('fecha_obtencion', form.fecha_obtencion);
    data.append('estado', form.estado);
    if (form.archivo) data.append('archivo', form.archivo);
    try {
      if (certificacion) {
        await updateCertificacion(certificacion.id_certificacion, data);
      } else {
        await addCertificacion(data);
      }
      onSuccess();
    } catch (err) {
      setError('Error al guardar la certificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="certificacion-modal-bg">
      <form className="certificacion-form" onSubmit={handleSubmit}>
        <h3>{certificacion ? 'Editar' : 'Agregar'} Certificación</h3>
        {error && <p className="error">{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Nombre:</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
          {fieldErrors.nombre && <span className="error">{fieldErrors.nombre}</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Institución:</label>
          <input name="institucion" value={form.institucion} onChange={handleChange} required />
          {fieldErrors.institucion && <span className="error">{fieldErrors.institucion}</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Fecha de obtención:</label>
          <input type="date" name="fecha_obtencion" value={form.fecha_obtencion} onChange={handleChange} required />
          {fieldErrors.fecha_obtencion && <span className="error">{fieldErrors.fecha_obtencion}</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Archivo (PDF/JPG/PNG):</label>
          <input type="file" name="archivo" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
          {certificacion?.archivo && <span style={{ marginLeft: 4, fontSize: 12, color: '#888' }}>(Ya existe un archivo)</span>}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CertificacionForm; 