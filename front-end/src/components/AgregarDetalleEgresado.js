import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmpresas, getEgresados, addDetalleEgresado } from '../services/api';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import './AgregarDetalleEgresado.css';

function AgregarDetalleEgresado() {
  const navigate = useNavigate();
  const [egresados, setEgresados] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [formData, setFormData] = useState({
    codigo_egresado: '',
    fecha_egreso: '',
    empresa_actual: '',
    empresa_actual_otro: '',
    cargo_actual: '',
    pais_residencia: '',
    ciudad_residencia: '',
    fecha_incorporacion: '',
    area_trabajo: '',
    sueldo_actual: '',
    correo: '',
    estado: 'A'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEgresados();
    getEmpresas().then(res => setEmpresas(res.data.empresas || []));
  }, []);

  const fetchEgresados = async () => {
    try {
      const response = await getEgresados();
      setEgresados(Array.isArray(response.data.egresados) ? response.data.egresados : []);
    } catch (error) {
      console.error('Error al obtener los egresados:', error);
      setMessage('Error al cargar la lista de egresados');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.codigo_egresado) newErrors.codigo_egresado = 'Seleccione un egresado';
    if (!formData.fecha_egreso) newErrors.fecha_egreso = 'Ingrese la fecha de egreso';
    if (!formData.empresa_actual) newErrors.empresa_actual = 'Seleccione una empresa';
    if (formData.empresa_actual === 'OTRA') {
      if (!formData.empresa_actual_otro) {
        newErrors.empresa_actual_otro = 'Ingrese el nombre de la empresa';
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(formData.empresa_actual_otro)) {
        newErrors.empresa_actual_otro = 'Solo letras y espacios en el nombre de la empresa';
      }
    }
    if (!formData.cargo_actual) newErrors.cargo_actual = 'Ingrese el cargo actual';
    if (!formData.pais_residencia) newErrors.pais_residencia = 'Ingrese el país de residencia';
    if (!formData.ciudad_residencia) newErrors.ciudad_residencia = 'Ingrese la ciudad de residencia';
    if (!formData.fecha_incorporacion) newErrors.fecha_incorporacion = 'Ingrese la fecha de incorporación';
    if (formData.fecha_egreso && formData.fecha_incorporacion) {
      const egreso = new Date(formData.fecha_egreso);
      const incorporacion = new Date(formData.fecha_incorporacion);
      if (incorporacion < egreso) newErrors.fecha_incorporacion = 'La fecha de incorporación no puede ser anterior a la fecha de egreso';
    }
    if (!formData.area_trabajo) newErrors.area_trabajo = 'Ingrese el área de trabajo';
    if (formData.sueldo_actual === '' || isNaN(formData.sueldo_actual) || Number(formData.sueldo_actual) < 0) newErrors.sueldo_actual = 'Ingrese un sueldo válido';
    if (!formData.correo) {
      newErrors.correo = 'Ingrese el correo';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.correo)) {
      newErrors.correo = 'Ingrese un correo válido';
    }
    if (!formData.estado) newErrors.estado = 'Seleccione el estado';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Construir el payload solo con los campos válidos para el backend
      const payload = {
        codigo_egresado: formData.codigo_egresado,
        fecha_egreso: formData.fecha_egreso || null,
        empresa_actual: formData.empresa_actual === 'OTRA' ? formData.empresa_actual_otro : formData.empresa_actual,
        cargo_actual: formData.cargo_actual,
        pais_residencia: formData.pais_residencia,
        ciudad_residencia: formData.ciudad_residencia,
        fecha_incorporacion: formData.fecha_incorporacion || null,
        area_trabajo: formData.area_trabajo,
        sueldo_actual: formData.sueldo_actual ? parseFloat(formData.sueldo_actual) : null,
        estado: formData.estado
      };

      await addDetalleEgresado(payload);
      setMessage('Detalle de egresado agregado exitosamente!');
      
      // Limpiar formulario
      setFormData({
        codigo_egresado: '',
        fecha_egreso: '',
        empresa_actual: '',
        empresa_actual_otro: '',
        cargo_actual: '',
        pais_residencia: '',
        ciudad_residencia: '',
        fecha_incorporacion: '',
        area_trabajo: '',
        sueldo_actual: '',
        correo: '',
        estado: 'A'
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/detalles');
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error al agregar el detalle:', error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error al agregar el detalle de egresado');
      }
    } finally {
      setLoading(false);
    }
  };

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
        <h2>Agregar Nuevo Detalle de Egresado</h2>
      </div>

      {message && (
        <div className={`message ${message.includes('exitosamente') ? 'success' : 'error'}`}>
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
              {Array.isArray(egresados) && egresados.map(egresado => (
                <option key={egresado.codigo} value={egresado.codigo}>
                  {egresado.codigo} - {egresado.nombre} {egresado.apellidos}
                </option>
              ))}
            </select>
            {errors.codigo_egresado && <div className="error-message">{errors.codigo_egresado}</div>}
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
            {errors.fecha_egreso && <div className="error-message">{errors.fecha_egreso}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Empresa Actual:</label>
            <select
              name="empresa_actual"
              value={formData.empresa_actual}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una empresa</option>
              {empresas.map(emp => (
                <option key={emp.id_empresa} value={emp.nombre}>
                  {emp.nombre}
                </option>
              ))}
              <option value="OTRA">Otra (escribir manualmente)</option>
            </select>
            {formData.empresa_actual === 'OTRA' && (
              <input
                type="text"
                name="empresa_actual_otro"
                placeholder="Nombre de la empresa"
                value={formData.empresa_actual_otro || ''}
                onChange={handleChange}
                required
              />
            )}
            {errors.empresa_actual && <div className="error-message">{errors.empresa_actual}</div>}
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
            {errors.cargo_actual && <div className="error-message">{errors.cargo_actual}</div>}
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
            {errors.pais_residencia && <div className="error-message">{errors.pais_residencia}</div>}
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
            {errors.ciudad_residencia && <div className="error-message">{errors.ciudad_residencia}</div>}
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
            {errors.fecha_incorporacion && <div className="error-message">{errors.fecha_incorporacion}</div>}
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
            {errors.area_trabajo && <div className="error-message">{errors.area_trabajo}</div>}
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
            {errors.sueldo_actual && <div className="error-message">{errors.sueldo_actual}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo:</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
            />
            {errors.correo && <div className="error-message">{errors.correo}</div>}
          </div>
        </div>

        <div className="form-row">
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
            {errors.estado && <div className="error-message">{errors.estado}</div>}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            <FaUserPlus size={20} style={{ marginRight: '8px' }} />
            {loading ? 'Agregando...' : 'Agregar Detalle'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgregarDetalleEgresado; 