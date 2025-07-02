// App.js
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgregarEgresado from './components/AgregarEgresado';
import EditarEgresado from './components/EditarEgresado';
import EncuestaFormulario from './components/EncuestaFormulario';
import Encuestas from './components/Encuestas';
import EgresadoList from './components/EgresadoList';
import DetalleEgresadoList from './components/DetalleEgresadoList';
import Reportes from './components/Reportes';
import Estadisticas from './components/Estadisticas';
import ReportesAutomatizados from './components/ReportesAutomatizados';
import AgregarDetalleEgresado from './components/AgregarDetalleEgresado';
import HistorialLaboral from './components/HistorialLaboral';
import EmpresaList from './components/EmpresaList';
import EmpresaForm from './components/EmpresaForm';
import './App.css';

function App() {
  const [filter, setFilter] = useState('A');
  const [message, setMessage] = useState('');

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route
              path="/"
              element={
                <EgresadoList
                  filter={filter}
                  setFilter={setFilter}
                  message={message}
                  setMessage={setMessage}
                />
              }
            />
            <Route path="/agregar" element={<AgregarEgresado />} />
            <Route
              path="/editar/:codigo"
              element={
                <EditarEgresado
                  setMessage={setMessage}
                />
              }
            />
            <Route path="/encuestas" element={<Encuestas />} />
            <Route path="/encuestas/:tipo" element={<EncuestaFormulario />} />
            <Route path="/detalles" element={<DetalleEgresadoList />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/reportes-automatizados" element={<ReportesAutomatizados />} />
            <Route path="/agregar-detalle" element={<AgregarDetalleEgresado />} />
            <Route path="/historial/:codigo" element={<HistorialLaboral />} />
            <Route path="/empresas" element={<EmpresaList />} />
            <Route path="/empresas/nueva" element={<EmpresaForm />} />
            <Route path="/empresas/editar/:id" element={<EmpresaForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
