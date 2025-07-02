import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEgresados, updateEgresado } from '../services/api';
import './EditarEgresado.css';  // Asegúrate de tener el CSS para estilos

function EditarEgresado({ setMessage, fetchEgresados }) {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [egresado, setEgresado] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    correo: '',
    telefono: '',
    carrera: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEgresado = async () => {
      try {
        const response = await getEgresados(codigo);
        setEgresado(response.data);
      } catch (error) {
        setMessage('No se pudo cargar la información del egresado.');
      } finally {
        setLoading(false);
      }
    };
    fetchEgresado();
  }, [codigo, setMessage]);

  const handleChange = (e) => {
    setEgresado({
      ...egresado,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (egresado.dni.length < 8) {
      setMessage('DNI debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await updateEgresado(codigo, egresado);
      setMessage('Egresado actualizado correctamente!');
      fetchEgresados();
      navigate('/');
    } catch {
      setMessage('Error al actualizar el egresado');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-message">Cargando...</div>;
  }

  return (
    <div className="form-container">
      <h2>Editar Egresado</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input type="text" name="nombre" value={egresado.nombre} onChange={handleChange} required />
        </label>
        <label>
          Apellidos:
          <input type="text" name="apellidos" value={egresado.apellidos} onChange={handleChange} required />
        </label>
        <label>
          DNI:
          <input type="text" name="dni" value={egresado.dni} onChange={handleChange} required />
        </label>
        <label>
          Correo:
          <input type="email" name="correo" value={egresado.correo} onChange={handleChange} required />
        </label>
        <label>
          Teléfono:
          <input type="text" name="telefono" value={egresado.telefono} onChange={handleChange} required />
        </label>
        <label>
          Carrera:
          <input type="text" name="carrera" value={egresado.carrera} onChange={handleChange} required />
        </label>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

export default EditarEgresado;
