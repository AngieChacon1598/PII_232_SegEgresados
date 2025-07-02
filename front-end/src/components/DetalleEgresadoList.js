import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getDetalleEgresados,
  getEgresados,
  deleteDetalleEgresado,
  restoreDetalleEgresado
} from '../services/api';
import { FaTrashAlt, FaEdit, FaUndo, FaUsers, FaCircle, FaPlus } from 'react-icons/fa';
import './DetalleEgresadoList.css';

function DetalleEgresadoList() {
  const [detalles, setDetalles] = useState([]);
  const [egresados, setEgresados] = useState([]);
  const [filter, setFilter] = useState('A');
  const [codigoFilter, setCodigoFilter] = useState('');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchDetalles = async () => {
    try {
      console.log('Llamando getDetalleEgresados con:', filter, codigoFilter, page, perPage);
      const response = await getDetalleEgresados(filter, codigoFilter, page, perPage);
      setDetalles(Array.isArray(response.data.detalles) ? response.data.detalles : []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error al obtener los detalles:', error);
      setMessage('Error al cargar los detalles de egresados');
      setDetalles([]);
      setTotalPages(1);
    }
  };

  const fetchEgresados = async () => {
    try {
      const params = new URLSearchParams();
      params.append('estado', 'A');
      const response = await getEgresados(params);
      setEgresados(Array.isArray(response.data.egresados) ? response.data.egresados : []);
    } catch (error) {
      console.error('Error al obtener los egresados:', error);
      setEgresados([]);
    }
  };

  const deleteDetalle = async (idDetalle) => {
    if (!window.confirm('¿Estás seguro de eliminar este detalle de egresado?')) return;
    try {
      await deleteDetalleEgresado(idDetalle);
      fetchDetalles();
      setMessage('Detalle de egresado eliminado correctamente!');
    } catch (error) {
      setMessage('Error al eliminar el detalle de egresado');
    }
  };

  const restoreDetalle = async (idDetalle) => {
    try {
      await restoreDetalleEgresado(idDetalle);
      fetchDetalles();
      setMessage('Detalle de egresado restaurado correctamente!');
    } catch (error) {
      setMessage('Error al restaurar el detalle de egresado');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [filter, codigoFilter, perPage]);

  useEffect(() => {
    fetchDetalles();
    fetchEgresados();
  }, [filter, codigoFilter, page, perPage]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <div className="header-bar">
        <div className="header-title"></div>
        <div className="header-breadcrumb">GESTIÓN <span className="breadcrumb-separator">&gt;</span> DETALLES DE EGRESADOS</div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="search-filters">
        <div className="row-filtros">
          <div className="filter-select">
            <label htmlFor="codigoFilter">Filtrar por egresado:</label>
            <select 
              id="codigoFilter" 
              value={codigoFilter} 
              onChange={(e) => setCodigoFilter(e.target.value)}
            >
              <option value="">Todos los egresados</option>
              {egresados.map(egresado => (
                <option key={egresado.codigo} value={egresado.codigo}>
                  {egresado.codigo} - {egresado.nombre} {egresado.apellidos}
                </option>
              ))}
            </select>
          </div>
          <div className="per-page-selector">
            <label htmlFor="perPage">Registros por página:</label>
            <select
              id="perPage"
              value={perPage}
              onChange={e => setPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>
        <div className="row-add">
          <Link to="/agregar-detalle" className="add-button">
            <FaPlus size={16} />
            Agregar Detalle
          </Link>
        </div>
        <div className="row-botones">
          <div className="filter-buttons">
            <button onClick={() => setFilter('A')} disabled={filter === 'A'}>
              Mostrar Activos
            </button>
            <button onClick={() => setFilter('I')} disabled={filter === 'I'}>
              Mostrar Inactivos
            </button>
          </div>
        </div>
      </div>

      {(!detalles || detalles.length === 0) ? (
        <p className="no-data">No se encontraron detalles de egresados.</p>
      ) : (
        <div className="detalle-list">
          <h2>Lista de Detalles de Egresados</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Egresado</th>
                  <th>Fecha Egreso</th>
                  <th>Empresa</th>
                  <th>Cargo</th>
                  <th>País</th>
                  <th>Ciudad</th>
                  <th>Fecha Incorporación</th>
                  <th>Área</th>
                  <th>Sueldo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle) => (
                  <tr key={detalle.id_detalle}>
                    <td>{detalle.id_detalle}</td>
                    <td>{detalle.egresado_nombre || detalle.codigo_egresado}</td>
                    <td>{formatDate(detalle.fecha_egreso)}</td>
                    <td>{detalle.empresa_actual || 'N/A'}</td>
                    <td>{detalle.cargo_actual || 'N/A'}</td>
                    <td>{detalle.pais_residencia || 'N/A'}</td>
                    <td>{detalle.ciudad_residencia || 'N/A'}</td>
                    <td>{formatDate(detalle.fecha_incorporacion)}</td>
                    <td>{detalle.area_trabajo || 'N/A'}</td>
                    <td>{formatCurrency(detalle.sueldo_actual)}</td>
                    <td style={{ display: 'flex', justifyContent: 'center', background: 'transparent' }}>
                      {detalle.estado === 'A' ? (
                        <FaCircle style={{ color: 'green', fontSize: '15px' }} title="Activo" />
                      ) : (
                        <FaCircle style={{ color: 'orange', fontSize: '15px' }} title="Inactivo" />
                      )}
                    </td>
                    <td>
                      <div className="acciones">
                        {detalle.estado === 'I' ? (
                          <button
                            className="btn restore"
                            onClick={() => restoreDetalle(detalle.id_detalle)}
                            title="Restaurar detalle"
                          >
                            <FaUndo />
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn delete"
                              onClick={() => deleteDetalle(detalle.id_detalle)}
                              title="Eliminar detalle"
                            >
                              <FaTrashAlt />
                            </button>
                            <Link
                              to={`/editar-detalle/${detalle.id_detalle}`}
                              className="btn edit"
                              title="Editar detalle"
                            >
                              <FaEdit />
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="pagination">
              <button onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={page === i + 1 ? 'active' : ''}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DetalleEgresadoList;
