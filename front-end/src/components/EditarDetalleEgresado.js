import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEgresados, getDetalleEgresados, updateDetalleEgresado } from '../services/api';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import './EditarDetalleEgresado.css';

function EditarDetalleEgresado() {
  const { idDetalle } = useParams();
  const navigate = useNavigate();
  const [egresados, setEgresados] = useState([]);
  const [formData, setFormData] = useState({
    codigo_egresado: '',
    fecha_egreso: '',
    empresa_actual: '',
    cargo_actual: '',
    pais_residencia: '',
    ciudad_residencia: '',
    fecha_incorporacion: '',
    area_trabajo: '',
    sueldo_actual: '',
    estado: 'A'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEgresados();
    fetchDetalle();
  }, [idDetalle]);

  const fetchEgresados = async () => {
    try {
      const response = await getEgresados();
      setEgresados(response.data);
    } catch (error) {
      console.error('Error al obtener los egresados:', error);
      setMessage('Error al cargar la lista de egresados');
    }
  };

  const fetchDetalle = async () => {
    try {
      const response = await getDetalleEgresados(idDetalle);
      const detalle = response.data;
      
      setFormData({
        codigo_egresado: detalle.codigo_egresado || '',
        fecha_egreso: detalle.fecha_egreso ? detalle.fecha_egreso.split('T')[0] : '',
        empresa_actual: detalle.empresa_actual || '',
        cargo_actual: detalle.cargo_actual || '',
        pais_residencia: detalle.pais_residencia || '',
        ciudad_residencia: detalle.ciudad_residencia || '',
        fecha_incorporacion: detalle.fecha_incorporacion ? detalle.fecha_incorporacion.split('T')[0] : '',
        area_trabajo: detalle.area_trabajo || '',
        sueldo_actual: detalle.sueldo_actual ? detalle.sueldo_actual.toString() : '',
        estado: detalle.estado || 'A'
      });
    } catch (error) {
      console.error('Error al obtener el detalle:', error);
      setMessage('No se pudo cargar la información del detalle de egresado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.codigo_egresado) {
      setMessage('Debe seleccionar un egresado');
      return false;
    }

    if (formData.sueldo_actual && parseFloat(formData.sueldo_actual) < 0) {
      setMessage('El sueldo debe ser un valor positivo');
      return false;
    }

    if (formData.fecha_egreso && formData.fecha_incorporacion) {
      const fechaEgreso = new Date(formData.fecha_egreso);
      const fechaIncorporacion = new Date(formData.fecha_incorporacion);
      
      if (fechaIncorporacion < fechaEgreso) {
        setMessage('La fecha de incorporación no puede ser anterior a la fecha de egreso');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const detalleData = {
        ...formData,
        sueldo_actual: formData.sueldo_actual ? parseFloat(formData.sueldo_actual) : null
      };

      await updateDetalleEgresado(idDetalle, detalleData);
      setMessage('Detalle de egresado actualizado correctamente!');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/detalles');
      }, 2000);

    } catch (error) {
      console.error('Error al actualizar el detalle:', error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error al actualizar el detalle de egresado');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información del detalle...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button 
          className="back-button" 
          onClick={() => navigate('/detalles')}
          type="button"
        >
          <FaArrowLeft />
          Volver
        </button>
        <h2>Editar Detalle de Egresado</h2>
      </div>

      {message && (
        <div className={`message ${message.includes('correctamente') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="detalle-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="codigo_egresado">Egresado: *</label>
            <select
              id="codigo_egresado"
              name="codigo_egresado"
              value={formData.codigo_egresado}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un egresado</option>
              {egresados.map(egresado => (
                <option key={egresado.codigo} value={egresado.codigo}>
                  {egresado.codigo} - {egresado.nombre} {egresado.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha_egreso">Fecha de Egreso:</label>
            <input
              type="date"
              id="fecha_egreso"
              name="fecha_egreso"
              value={formData.fecha_egreso}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="empresa_actual">Empresa Actual:</label>
            <input
              type="text"
              id="empresa_actual"
              name="empresa_actual"
              value={formData.empresa_actual}
              onChange={handleChange}
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cargo_actual">Cargo Actual:</label>
            <input
              type="text"
              id="cargo_actual"
              name="cargo_actual"
              value={formData.cargo_actual}
              onChange={handleChange}
              placeholder="Cargo o puesto"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pais_residencia">País de Residencia:</label>
            <input
              type="text"
              id="pais_residencia"
              name="pais_residencia"
              value={formData.pais_residencia}
              onChange={handleChange}
              placeholder="País"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ciudad_residencia">Ciudad de Residencia:</label>
            <input
              type="text"
              id="ciudad_residencia"
              name="ciudad_residencia"
              value={formData.ciudad_residencia}
              onChange={handleChange}
              placeholder="Ciudad"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_incorporacion">Fecha de Incorporación:</label>
            <input
              type="date"
              id="fecha_incorporacion"
              name="fecha_incorporacion"
              value={formData.fecha_incorporacion}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="area_trabajo">Área de Trabajo:</label>
            <input
              type="text"
              id="area_trabajo"
              name="area_trabajo"
              value={formData.area_trabajo}
              onChange={handleChange}
              placeholder="Área o departamento"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sueldo_actual">Sueldo Actual:</label>
            <input
              type="number"
              id="sueldo_actual"
              name="sueldo_actual"
              value={formData.sueldo_actual}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado:</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={saving}
          >
            <FaEdit size={20} style={{ marginRight: '8px' }} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarDetalleEgresado; 