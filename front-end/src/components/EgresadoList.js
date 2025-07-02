// src/components/EgresadoList.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaEdit, FaUndo, FaUsers, FaCircle, FaEye, FaSearch, FaTimes } from 'react-icons/fa';
import './EgresadoList.css';
import { getEgresados, getCarreras, deleteEgresado, restoreEgresado } from '../services/api';

const EgresadoList = ({
  filter,
  setFilter,
  message,
  setMessage,
}) => {
  const [egresados, setEgresados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carreras, setCarreras] = useState([]);
  const [filtros, setFiltros] = useState({
    apellidos: '',
    dni: '',
    carrera: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchEgresados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        estado: filter,
        page,
        per_page: perPage,
        ...(filtros.apellidos && { apellidos: filtros.apellidos }),
        ...(filtros.dni && { dni: filtros.dni }),
        ...(filtros.carrera && { carrera: filtros.carrera })
      });
      
      const response = await getEgresados(params);
      console.log('Respuesta de la API:', response.data);
      setEgresados(Array.isArray(response.data.egresados) ? response.data.egresados : []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      setMessage('Error al obtener los egresados');
      setEgresados([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarreras = async () => {
    try {
      const response = await getCarreras();
      setCarreras(response.data.carreras || []);
    } catch (error) {
      console.error('Error al obtener carreras:', error);
    }
  };

  useEffect(() => {
    setPage(1); // Resetear a la primera página al cambiar filtros o perPage
  }, [filter, JSON.stringify(filtros), perPage]);

  useEffect(() => {
    fetchEgresados();
    fetchCarreras();
    // eslint-disable-next-line
  }, [filter, filtros, page, perPage]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      apellidos: '',
      dni: '',
      carrera: ''
    });
  };

  const deleteEgresado = async (codigo) => {
    if (!window.confirm('¿Estás seguro de eliminar este egresado?')) return;
    try {
      await deleteEgresado(codigo);
      fetchEgresados();
      setMessage('Egresado actualizado correctamente!');
    } catch (error) {
      setMessage('Error al eliminar el egresado');
    }
  };

  const restoreEgresado = async (codigo) => {
    try {
      await restoreEgresado(codigo);
      fetchEgresados();
      setMessage('Egresado restaurado correctamente!');
    } catch (error) {
      setMessage('Error al restaurar el egresado');
    }
  };

  // Log detallado para depuración de propiedades objeto
  if (Array.isArray(egresados)) {
    egresados.forEach((egresado, i) => {
      console.log('egresado', i, egresado);
      Object.entries(egresado).forEach(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          console.log(`Propiedad ${k} es un objeto:`, v);
        }
      });
    });
  }

  return (
    <>
      <div className="header-bar">
        <div className="header-title"></div>
        <div className="header-breadcrumb">GESTIÓN <span className="breadcrumb-separator">&gt;</span> EGRESADOS</div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="filter-buttons">
        <button onClick={() => setFilter('A')} disabled={filter === 'A'}>
          Mostrar Activos
        </button>
        <button onClick={() => setFilter('I')} disabled={filter === 'I'}>
          Mostrar Inactivos
        </button>
      </div>

      <div className="filtros-tabla-wrapper">
        <div className="search-filters">
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="apellidos">Apellidos:</label>
              <input
                type="text"
                id="apellidos"
                value={filtros.apellidos}
                onChange={(e) => handleFiltroChange('apellidos', e.target.value)}
                placeholder="Buscar por apellidos..."
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="dni">DNI:</label>
              <input
                type="text"
                id="dni"
                value={filtros.dni}
                onChange={(e) => handleFiltroChange('dni', e.target.value)}
                placeholder="Buscar por DNI..."
                className="filter-input"
                maxLength="8"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="carrera">Carrera:</label>
              <select
                id="carrera"
                value={filtros.carrera}
                onChange={(e) => handleFiltroChange('carrera', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las carreras</option>
                {carreras.map((carrera, index) => (
                  <option key={index} value={carrera}>
                    {carrera}
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
            <button 
              onClick={limpiarFiltros} 
              className="clear-filters-btn"
              title="Limpiar filtros"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando egresados...</p>
        ) : (Array.isArray(egresados) && egresados.length === 0) ? (
          <p>No se encontraron egresados.</p>
        ) : (
          <div className="egresado-list">
            <h2>Lista de Egresados</h2>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>DNI</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono</th>
                  <th>Carrera</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {egresados.map((egresado) => (
                  <tr key={egresado.codigo}>
                    <td>{typeof egresado.codigo === 'object' && egresado.codigo !== null ? '[objeto]' : egresado.codigo}</td>
                    <td>{typeof egresado.nombre === 'object' && egresado.nombre !== null ? '[objeto]' : egresado.nombre}</td>
                    <td>{typeof egresado.apellidos === 'object' && egresado.apellidos !== null ? '[objeto]' : egresado.apellidos}</td>
                    <td>{typeof egresado.dni === 'object' && egresado.dni !== null ? '[objeto]' : egresado.dni}</td>
                    <td>{typeof egresado.correo === 'object' && egresado.correo !== null ? '[objeto]' : egresado.correo}</td>
                    <td>{typeof egresado.telefono === 'object' && egresado.telefono !== null ? '[objeto]' : egresado.telefono}</td>
                    <td>{typeof egresado.carrera === 'object' && egresado.carrera !== null ? '[objeto]' : egresado.carrera}</td>
                    <td style={{ display: 'flex', justifyContent: 'center', verticalAlign: 'middle', background: 'transparent'}}>
                      {egresado.estado === 'A' ? (
                        <FaCircle style={{ color: 'green', fontSize: '15px'}} title="Activo" />
                      ) : (
                        <FaCircle style={{ color: 'orange', fontSize: '15px'}} title="Inactivo" />
                      )}
                    </td>
                    <td>
                      <div className="acciones">
                        <Link
                          to={`/historial/${egresado.codigo}`}
                          className="btn historial"
                          title="Ver historial laboral"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#6c63ff',
                            color: 'white',
                            borderRadius: '8px',
                            width: '36px',
                            height: '36px',
                            fontSize: '20px'
                          }}
                        >
                          <FaEye />
                        </Link>
                        {egresado.estado === 'I' ? (
                          <button
                            className="btn restore"
                            onClick={() => restoreEgresado(egresado.codigo)}
                            title="Restaurar egresado"
                          >
                            <FaUndo />
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn delete"
                              onClick={() => deleteEgresado(egresado.codigo)}
                              title="Eliminar egresado"
                            >
                              <FaTrashAlt />
                            </button>
                            <Link
                              to={`/editar/${egresado.codigo}`}
                              className="btn edit"
                              title="Editar egresado"
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
        )}
      </div>
    </>
  );
};

export default EgresadoList;
