import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaUndo, FaPlus } from 'react-icons/fa';
import './Empresa.css';
import { getEmpresas, deleteEmpresa, restoreEmpresa } from '../services/api';

function EmpresaList() {
  const [empresas, setEmpresas] = useState([]);
  const [filter, setFilter] = useState('A');
  const [message, setMessage] = useState('');
  const [busqueda, setBusqueda] = useState({ nombre: '', ruc: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchEmpresas = async () => {
    try {
      const params = new URLSearchParams({
        estado: filter,
        page,
        per_page: perPage,
        ...(busqueda.nombre && { nombre: busqueda.nombre }),
        ...(busqueda.ruc && { ruc: busqueda.ruc })
      });
      const response = await getEmpresas(params);
      setEmpresas(response.data.empresas || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      setMessage('Error al obtener empresas');
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [filter, page, perPage, busqueda]);

  const handleBusqueda = e => {
    setBusqueda({ ...busqueda, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="empresa-list">
      <h2>Empresas</h2>
      <div className="barra-superior-empresa">
        <div className="filtros-empresa-btns">
          <button onClick={() => setFilter('A')} disabled={filter === 'A'} className={filter === 'A' ? 'activo' : ''}>Mostrar Activas</button>
          <button onClick={() => setFilter('I')} disabled={filter === 'I'} className={filter === 'I' ? 'activo' : ''}>Mostrar Inactivas</button>
        </div>
        <Link to="/empresas/nueva" className="btn-agregar-empresa">
          <FaPlus style={{ marginRight: 8 }} /> Agregar Empresa
        </Link>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label>Nombre:</label>
          <input name="nombre" value={busqueda.nombre} onChange={handleBusqueda} placeholder="Buscar por nombre..." />
        </div>
        <div>
          <label>RUC:</label>
          <input name="ruc" value={busqueda.ruc} onChange={handleBusqueda} placeholder="Buscar por RUC..." maxLength={11} />
        </div>
        <div>
          <label>Registros por página:</label>
          <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
      </div>
      {message && <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>}
      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>RUC</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map(e => (
            <tr key={e.id_empresa}>
              <td>{e.id_empresa}</td>
              <td>{e.nombre}</td>
              <td>{e.ruc}</td>
              <td>{e.direccion}</td>
              <td>{e.telefono}</td>
              <td>{e.correo}</td>
              <td>{e.estado === 'A' ? 'Activa' : 'Inactiva'}</td>
              <td>
                <div className="acciones">
                  {e.estado === 'I' ? (
                    <button className="icon-btn restore" onClick={() => restoreEmpresa(e.id_empresa)} title="Restaurar">
                      <FaUndo />
                    </button>
                  ) : (
                    <>
                      <Link to={`/empresas/editar/${e.id_empresa}`} className="icon-btn edit" title="Editar">
                        <FaEdit />
                      </Link>
                      <button className="icon-btn delete" onClick={() => deleteEmpresa(e.id_empresa)} title="Eliminar">
                        <FaTrashAlt />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Paginación */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18, gap: 4 }}>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            style={{ fontWeight: page === i + 1 ? 'bold' : 'normal', background: page === i + 1 ? '#1976d2' : '#fff', color: page === i + 1 ? '#fff' : '#1976d2', borderRadius: 4, border: '1px solid #1976d2', padding: '6px 12px' }}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Siguiente</button>
      </div>
    </div>
  );
}

export default EmpresaList; 