import React, { useEffect, useState } from 'react';
import { getCertificaciones, deleteCertificacion, downloadCertificacion } from '../services/api';
import { FaDownload, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

function CertificacionList({ codigo_egresado, onEdit, onAdd, refresh }) {
  const [certificaciones, setCertificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCertificaciones = async () => {
    setLoading(true);
    try {
      const res = await getCertificaciones(codigo_egresado);
      setCertificaciones(res.data.certificaciones || []);
    } catch (err) {
      setError('Error al cargar certificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codigo_egresado) fetchCertificaciones();
    // eslint-disable-next-line
  }, [codigo_egresado, refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta certificación?')) return;
    try {
      await deleteCertificacion(id);
      fetchCertificaciones();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  const handleDownload = (id) => {
    downloadCertificacion(id);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Certificaciones / Capacitaciones</h3>
        <button className="btn btn-primary" onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 6, border: 'none', padding: '10px 28px', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', minHeight: 40, minWidth: 110, boxShadow: '0 2px 8px rgba(25,118,210,0.08)' }}>
          <FaPlus /> Agregar
        </button>
      </div>
      {loading ? <p>Cargando...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
        <table style={{ width: '100%', marginTop: 12, background: 'white', borderCollapse: 'collapse', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderRadius: 10, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#1976d2', color: 'white' }}>
              <th style={{ padding: 10 }}>Nombre</th>
              <th style={{ padding: 10 }}>Institución</th>
              <th style={{ padding: 10 }}>Fecha Obtención</th>
              <th style={{ padding: 10 }}>Archivo</th>
              <th style={{ padding: 10 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {certificaciones.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 18, color: '#888' }}>No hay certificaciones registradas.</td></tr>
            ) : certificaciones.map((cert, idx) => (
              <tr key={cert.id_certificacion} style={{ background: idx % 2 === 0 ? '#f7fafd' : 'white' }}>
                <td style={{ padding: 10 }}>{cert.nombre}</td>
                <td style={{ padding: 10 }}>{cert.institucion}</td>
                <td style={{ padding: 10 }}>{cert.fecha_obtencion ? new Date(cert.fecha_obtencion).toLocaleDateString('es-PE') : ''}</td>
                <td style={{ padding: 10 }}>
                  {cert.archivo ? (
                    <button className="btn" onClick={() => handleDownload(cert.id_certificacion)} title="Descargar archivo" style={{ background: '#43a047', color: 'white', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', marginRight: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <FaDownload />
                    </button>
                  ) : <span style={{ color: '#888' }}>Sin archivo</span>}
                </td>
                <td style={{ padding: 10, display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={() => onEdit(cert)} title="Editar" style={{ background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    <FaEdit />
                  </button>
                  <button className="btn" onClick={() => handleDelete(cert.id_certificacion)} title="Eliminar" style={{ background: '#d32f2f', color: 'white', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CertificacionList; 