import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDetalleEgresados, getEgresados } from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';
import CertificacionList from './CertificacionList';
import CertificacionForm from './CertificacionForm';

function HistorialLaboral() {
  const { codigo } = useParams();
  const [detalles, setDetalles] = useState([]);
  const [egresado, setEgresado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [certToEdit, setCertToEdit] = useState(null);
  const [refreshCerts, setRefreshCerts] = useState(false);

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const detallesRes = await getDetalleEgresados(codigo);
        setDetalles(Array.isArray(detallesRes.data.detalles) ? detallesRes.data.detalles : []);
        const egresadoRes = await getEgresados(codigo);
        setEgresado(egresadoRes.data);
      } catch (err) {
        setDetalles([]);
        setEgresado(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, [codigo]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Link to="/detalles" className="btn" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#333', fontWeight: 500 }}>
        <FaArrowLeft style={{ fontSize: 18 }} />
        <span>Volver a Detalles</span>
      </Link>
      <h2>Historial Laboral de Egresado</h2>
      {egresado && (
        <div style={{ marginBottom: 16 }}>
          <strong>{egresado.codigo} - {egresado.nombre} {egresado.apellidos}</strong><br />
          Carrera: {egresado.carrera}<br />
          Correo: {egresado.correo}
        </div>
      )}
      {/* Certificaciones */}
      {egresado && (
        <>
          <CertificacionList
            codigo_egresado={egresado.codigo}
            onEdit={cert => { setCertToEdit(cert); setShowForm(true); }}
            onAdd={() => { setCertToEdit(null); setShowForm(true); }}
            refresh={refreshCerts}
          />
          {showForm && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <CertificacionForm
                egresado={egresado}
                certificacion={certToEdit}
                onSuccess={() => { setShowForm(false); setCertToEdit(null); setRefreshCerts(r => !r); }}
                onCancel={() => { setShowForm(false); setCertToEdit(null); }}
              />
            </div>
          )}
        </>
      )}
      {/* Fin Certificaciones */}
      {loading ? (
        <p>Cargando historial...</p>
      ) : detalles.length === 0 ? (
        <p>No se encontraron registros de historial laboral para este egresado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Cargo</th>
              <th>País</th>
              <th>Ciudad</th>
              <th>Fecha Incorporación</th>
              <th>Fecha Egreso</th>
              <th>Área</th>
              <th>Sueldo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((detalle) => (
              <tr key={detalle.id_detalle}>
                <td>{detalle.empresa_actual || 'N/A'}</td>
                <td>{detalle.cargo_actual || 'N/A'}</td>
                <td>{detalle.pais_residencia || 'N/A'}</td>
                <td>{detalle.ciudad_residencia || 'N/A'}</td>
                <td>{detalle.fecha_incorporacion ? new Date(detalle.fecha_incorporacion).toLocaleDateString('es-ES') : 'N/A'}</td>
                <td>{detalle.fecha_egreso ? new Date(detalle.fecha_egreso).toLocaleDateString('es-ES') : 'N/A'}</td>
                <td>{detalle.area_trabajo || 'N/A'}</td>
                <td>{detalle.sueldo_actual ? `S/ ${detalle.sueldo_actual}` : 'N/A'}</td>
                <td>{detalle.estado === 'A' ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistorialLaboral; 