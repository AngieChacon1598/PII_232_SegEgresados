import React from 'react';
import ReporteEgresadosPorCarrera from './ReporteEgresadosPorCarrera';
import ReporteEgresadosPorEstado from './ReporteEgresadosPorEstado';
import ReporteEgresadosPorAnio from './ReporteEgresadosPorAnio';

const Reportes = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div className="header-bar">
        <div className="header-title">REPORTES</div>
        <div className="header-breadcrumb">GESTIÓN <span className="breadcrumb-separator">&gt;</span> REPORTES</div>
      </div>
      <div className="reportes-header">
        <h1 className="reportes-title">Reportes y Estadísticas del Egresado</h1>
        <p className="reportes-subtitle">
          Informes visuales y estadísticos sobre el total de egresados por empresa, cargo, área de trabajo, sueldo y más.
        </p>
      </div>
      <div style={{ marginBottom: 48 }}>
        <ReporteEgresadosPorCarrera />
      </div>
      <div style={{ marginBottom: 48 }}>
        <ReporteEgresadosPorEstado />
      </div>
      <div style={{ marginBottom: 48 }}>
        <ReporteEgresadosPorAnio />
      </div>
    </div>
  );
};

export default Reportes; 