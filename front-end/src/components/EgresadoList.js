// src/components/EgresadoList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrashAlt, FaEdit, FaUndo, FaCircle, FaEye, FaTimes } from 'react-icons/fa';
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
        page,
        per_page: perPage,
        ...(filter ? { estado: filter } : {}),
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
    setPage(1);
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

  const handleDelete = async (codigo) => {
    console.log("Intentando eliminar egresado:", codigo);
    if (!window.confirm('¿Estás seguro de eliminar este egresado?')) return;
    try {
      await deleteEgresado(codigo);
      fetchEgresados();
      setMessage('Egresado actualizado correctamente!');
    } catch (error) {
      setMessage('Error al eliminar el egresado');
      console.error("Error al eliminar:", error);
    }
  };

  const handleRestore = async (codigo) => {
    try {
      await restoreEgresado(codigo);
      fetchEgresados();
      setMessage('Egresado restaurado correctamente!');
    } catch (error) {
      setMessage('Error al restaurar el egresado');
    }
  };

  const obtenerCodigo = (codigo) => {
    return typeof codigo === 'object' && codigo !== null ? codigo.value : codigo;
  };

  return (
    <>
      <div className="header-bar">
        <div className="header-title"></div>
        <div className="header-breadcrumb">GESTIÓN <span className="breadcrumb-separator">&gt;</span> EGRESADOS</div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="filter-buttons">
        <button onClick={() => setFilter('')} className={filter === '' ? 'active' : ''}>
          Mostrar Todos
        </button>
        <button onClick={() => setFilter('A')} className={filter === 'A' ? 'active' : ''}>
          Mostrar Activos
        </button>
        <button onClick={() => setFilter('I')} className={filter === 'I' ? 'active' : ''}>
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
                  <option key={index} value={carrera}>{carrera}</option>
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

        {/* Botón de prueba para eliminar EG002 */}
        <button onClick={() => handleDelete('EG002')} style={{margin: '10px', background: 'red', color: 'white', padding: '8px', borderRadius: '5px'}}>Probar eliminar EG002</button>
        {/* Fin botón de prueba */}

        {loading ? (
          <p>Cargando egresados...</p>
        ) : (egresados.length === 0) ? (
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
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Carrera</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {egresados.map((egresado) => (
                  <tr key={obtenerCodigo(egresado.codigo)}>
                    <td>{obtenerCodigo(egresado.codigo)}</td>
                    <td>{egresado.nombre}</td>
                    <td>{egresado.apellidos}</td>
                    <td>{egresado.dni}</td>
                    <td>{egresado.correo}</td>
                    <td>{egresado.telefono}</td>
                    <td>{egresado.carrera}</td>
                    <td style={{ textAlign: 'center' }}>
                      <FaCircle
                        style={{ color: egresado.estado === 'A' ? 'green' : 'orange', fontSize: '15px' }}
                        title={egresado.estado === 'A' ? 'Activo' : 'Inactivo'}
                      />
                    </td>
                    <td>
                      <div className="acciones">
                        <Link to={`/historial/${obtenerCodigo(egresado.codigo)}`} className="btn historial" title="Ver historial laboral">
                          <FaEye />
                        </Link>
                        {egresado.estado === 'I' ? (
                          <button className="btn restore" onClick={() => handleRestore(obtenerCodigo(egresado.codigo))} title="Restaurar">
                            <FaUndo />
                          </button>
                        ) : (
                          <>
                            <button className="btn delete" onClick={() => handleDelete(obtenerCodigo(egresado.codigo))} title="Eliminar">
                              <FaTrashAlt />
                            </button>
                            <Link to={`/editar/${obtenerCodigo(egresado.codigo)}`} className="btn edit" title="Editar">
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
