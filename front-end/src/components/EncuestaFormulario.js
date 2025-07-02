import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enviarEncuesta } from '../services/api';

const formulariosPorTipo = {
  'satisfaccion': {
    titulo: 'Encuesta de Satisfacción',
    preguntas: [
      '¿Qué tan satisfecho estás con la calidad educativa?',
      '¿Recomendarías el instituto a otros?',
    ],
  },
  'estado-laboral': {
    titulo: 'Encuesta de Estado Laboral',
    preguntas: [
      '¿Actualmente estás trabajando?',
      '¿Tu trabajo está relacionado con tu carrera?',
    ],
  },
  'opinion-academica': {
    titulo: 'Encuesta de Opinión Académica',
    preguntas: [
      '¿Qué te parece la calidad de los docentes?',
      '¿El contenido de los cursos es actualizado?',
    ],
  },
  'seguimiento-profesional': {
    titulo: 'Encuesta de Seguimiento Profesional',
    preguntas: [
      '¿Has avanzado profesionalmente desde tu graduación?',
      '¿Qué dificultades has enfrentado?',
    ],
  },
  'feedback-cursos': {
    titulo: 'Encuesta de Feedback para Cursos',
    preguntas: [
      '¿Qué curso te gustó más?',
      '¿Qué mejorarías en los cursos?',
    ],
  },
  'habilidades': {
    titulo: 'Encuesta de Habilidades y Competencias',
    preguntas: [
      '¿Qué habilidades has desarrollado?',
      '¿Qué habilidades te gustaría mejorar?',
    ],
  },
};

const EncuestaFormulario = () => {
  const { tipo } = useParams();
  const formulario = formulariosPorTipo[tipo];

  const [respuestas, setRespuestas] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);

  if (!formulario) {
    return (
      <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
        <h2>Encuesta no encontrada</h2>
        <Link to="/encuestas">Volver a tipos de encuestas</Link>
      </div>
    );
  }

  const handleChange = (index, e) => {
    setRespuestas({ ...respuestas, [index]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tipoEncuesta: tipo,
      respuestas,
    };

    try {
      const result = await enviarEncuesta(payload);

      if (result.result === 'success') {
        setMensaje('Gracias por enviar la encuesta');
        setError(false);
        setRespuestas({});
      } else {
        setMensaje('Error al enviar la encuesta');
        setError(true);
      }
    } catch {
      setMensaje('Error al enviar la encuesta');
      setError(true);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>{formulario.titulo}</h2>

      {mensaje && (
        <p style={{ color: error ? 'red' : 'green', fontWeight: 'bold', marginBottom: 20 }}>
          {mensaje}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {formulario.preguntas.map((pregunta, i) => (
          <div key={i} style={{ marginBottom: 15 }}>
            <label>{pregunta}</label>
            <input
              type="text"
              value={respuestas[i] || ''}
              onChange={(e) => handleChange(i, e)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Enviar
        </button>
      </form>

      <Link to="/encuestas" style={{ display: 'block', marginTop: 20 }}>
        Volver a tipos de encuestas
      </Link>
    </div>
  );
};

export default EncuestaFormulario;
