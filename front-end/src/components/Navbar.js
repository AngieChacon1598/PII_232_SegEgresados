import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaListAlt,
  FaPlusCircle,
  FaInfoCircle,
  FaFileAlt,
  FaChartBar,
  FaPoll,
  FaUserCircle,
  FaBriefcase,
  FaEnvelope
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-user">
        <FaUserCircle className="user-icon" />
        <span className="user-name">Angie Chacon Ap.</span>
        <h6>angie.chacon.a@vallegrande.edu.pe</h6>
      </div>
      <ul>
        {/* Gestión de Egresados */}
        <li className="section-divider">
          <span className="section-title">GESTIÓN DE EGRESADOS</span>
        </li>
        <li>
          <Link to="/">
            <FaListAlt /> Lista de Egresados
          </Link>
        </li>
        <li>
          <Link to="/agregar">
            <FaPlusCircle /> Agregar Egresado
          </Link>
        </li>
        <li>
          <Link to="/detalles">
            <FaInfoCircle /> Detalles de Egresados
          </Link>
        </li>
        
        {/* Gestión de Empresas */}
        <li className="section-divider">
          <span className="section-title">GESTIÓN DE EMPRESAS</span>
        </li>
        <li>
          <Link to="/empresas">
            <FaBriefcase /> Empresas
          </Link>
        </li>
        
        {/* Reportes y Estadísticas */}
        <li className="section-divider">
          <span className="section-title">REPORTES Y ANÁLISIS</span>
        </li>
        <li>
          <Link to="/reportes">
            <FaFileAlt /> Reportes
          </Link>
        </li>
        <li>
          <Link to="/estadisticas">
            <FaChartBar /> Estadísticas
          </Link>
        </li>
        <li>
          <Link to="/reportes-automatizados">
            <FaEnvelope /> Reportes Automatizados
          </Link>
        </li>
        
        {/* Encuestas */}
        <li className="section-divider">
          <span className="section-title">ENCUESTAS</span>
        </li>
        <li>
          <Link to="/encuestas">
            <FaPoll /> Encuestas
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
