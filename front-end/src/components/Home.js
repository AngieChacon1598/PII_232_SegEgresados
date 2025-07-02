// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <h2>Bienvenidos a la Gestión de Egresados</h2>
      <p>Esta es la página de inicio.</p>
      <Link to="/listado">
        <button className="btn-navigate">Ver Lista de Egresados</button>
      </Link>
    </div>
  );
}

export default Home;

