import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSmile, FaBriefcase, FaChalkboardTeacher, FaUsers, FaComments, FaTools } from 'react-icons/fa';
import './Encuestas.css';

const encuestaTipos = [
  { id: 'satisfaccion', titulo: 'Encuesta de Satisfacción', descripcion: 'Mide la satisfacción general con el instituto.', icon: <FaSmile />, color: '#A5D6A7' },       // verde claro
  { id: 'estado-laboral', titulo: 'Encuesta de Estado Laboral', descripcion: 'Consulta sobre empleo y situación laboral.', icon: <FaBriefcase />, color: '#FFCC80' },     // naranja claro
  { id: 'opinion-academica', titulo: 'Encuesta de Opinión Académica', descripcion: 'Evalúa la calidad académica y docentes.', icon: <FaChalkboardTeacher />, color: '#90CAF9' }, // azul claro
  { id: 'seguimiento-profesional', titulo: 'Encuesta de Seguimiento Profesional', descripcion: 'Sigue la trayectoria después de la graduación.', icon: <FaUsers />, color: '#CE93D8' },  // morado claro
  { id: 'feedback-cursos', titulo: 'Encuesta de Feedback para Cursos', descripcion: 'Recopila opiniones específicas de cursos.', icon: <FaComments />, color: '#F48FB1' },  // rosa claro
  { id: 'habilidades', titulo: 'Encuesta de Habilidades y Competencias', descripcion: 'Identifica habilidades desarrolladas y requeridas.', icon: <FaTools />, color: '#FFE082' },  // amarillo claro
];

const Encuestas = () => {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/encuestas/${id}`);
  };

  return (
    <div className="encuestas-container">
      <div className="header-bar">
        <div className="header-title">ENCUESTAS</div>
        <div className="header-breadcrumb">GESTIÓN <span className="breadcrumb-separator">&gt;</span> ENCUESTAS</div>
      </div>
      <h2>Tipos de Encuestas</h2>
      <div className="cards-container">
        {encuestaTipos.map(({ id, titulo, descripcion, icon, color }) => (
          <div
            key={id}
            className="card"
            onClick={() => handleCardClick(id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') handleCardClick(id); }}
            style={{ background: color }}
          >
            <div className="icon-wrapper" style={{ background: `${color}aa` }}>
              {icon}
            </div>
            <h3>{titulo}</h3>
            <p>{descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Encuestas;
