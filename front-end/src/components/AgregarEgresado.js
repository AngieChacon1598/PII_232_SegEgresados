import React, { useState } from 'react';
import { addEgresado } from '../services/api';
import './AgregarEgresado.css'; // Agregar archivo CSS para los estilos
import { FaUserPlus } from 'react-icons/fa';


function AgregarEgresado({ fetchEgresados }) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [carrera, setCarrera] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!codigo) newErrors.codigo = 'El código es obligatorio';
    if (!nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!apellidos) newErrors.apellidos = 'Los apellidos son obligatorios';
    if (!dni) newErrors.dni = 'El DNI es obligatorio';
    else if (!/^\d{8}$/.test(dni)) newErrors.dni = 'El DNI debe tener 8 dígitos';
    if (!correo) newErrors.correo = 'El correo es obligatorio';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) newErrors.correo = 'Correo inválido';
    if (telefono && !/^\d{9}$/.test(telefono)) newErrors.telefono = 'El teléfono debe tener 9 dígitos';
    if (!carrera) newErrors.carrera = 'La carrera es obligatoria';
    if (nombre && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombre)) newErrors.nombre = 'El nombre solo puede contener letras y espacios';
    if (apellidos && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(apellidos)) newErrors.apellidos = 'Los apellidos solo pueden contener letras y espacios';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const limpiarFormulario = () => {
    setCodigo('');
    setNombre('');
    setApellidos('');
    setDni('');
    setCorreo('');
    setTelefono('');
    setCarrera('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const egresado = { codigo, nombre, apellidos, dni, correo, telefono, carrera, estado: 'A' };

    try {
      const response = await addEgresado(egresado);
      
      // Verificar si la respuesta es exitosa (código 201 o 200)
      if (response.status === 201 || response.status === 200) {
        alert('Egresado agregado exitosamente');
        limpiarFormulario();
        if (fetchEgresados) {
          fetchEgresados(); // Actualizar la lista de egresados
        }
      } else {
        alert('Error inesperado al agregar el egresado');
      }
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response) {
        // El servidor respondió con un código de error
        const errorMessage = error.response.data?.message || 'Error al agregar el egresado';
        alert(errorMessage);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        alert('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      } else {
        // Algo más causó el error
        alert('Error al procesar la solicitud');
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Agregar Nuevo Egresado</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Código:</label>
          <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código" required />
          {errors.codigo && <div className="error-message">{errors.codigo}</div>}
        </div>
        <div className="form-group">
          <label>Nombre:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" required />
          {errors.nombre && <div className="error-message">{errors.nombre}</div>}
        </div>
        <div className="form-group">
          <label>Apellidos:</label>
          <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos" required />
          {errors.apellidos && <div className="error-message">{errors.apellidos}</div>}
        </div>
        <div className="form-group">
          <label>DNI:</label>
          <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="DNI" required />
          {errors.dni && <div className="error-message">{errors.dni}</div>}
        </div>
        <div className="form-group">
          <label>Correo:</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="Correo" required />
          {errors.correo && <div className="error-message">{errors.correo}</div>}
        </div>
        <div className="form-group">
          <label>Teléfono:</label>
          <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" />
          {errors.telefono && <div className="error-message">{errors.telefono}</div>}
        </div>
        <div className="form-group">
          <label>Carrera:</label>
          <input type="text" value={carrera} onChange={(e) => setCarrera(e.target.value)} placeholder="Carrera" required />
          {errors.carrera && <div className="error-message">{errors.carrera}</div>}
        </div>
        <button className="submit-btn">
  <FaUserPlus size={20} style={{ marginRight: '8px' }} />
  Agregar Egresado
</button>
      </form>
    </div>
  );
}

export default AgregarEgresado;
