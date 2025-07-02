import React, { useEffect, useState } from 'react';
import { getEstadisticas } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { FaUsers, FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaChartLine, FaCertificate } from 'react-icons/fa';
import './Estadisticas.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Estadisticas = () => {
  const [egresados, setEgresados] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [certificaciones, setCertificaciones] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [egresadosRes, detallesRes, certRes, empresasRes] = await getEstadisticas();
        setEgresados(egresadosRes.data.egresados || []);
        setDetalles(detallesRes.data.detalles || []);
        setCertificaciones(certRes.data.certificaciones || []);
        setEmpresas(empresasRes.data.empresas || []);
        // Calcular estadísticas
        calcularEstadisticas(
          egresadosRes.data.egresados || [],
          detallesRes.data.detalles || [],
          certRes.data.certificaciones || [],
          empresasRes.data.empresas || []
        );
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calcularEstadisticas = (egresados, detalles, certificaciones, empresas) => {
    // 1. Tasa de empleabilidad por carrera
    const empleabilidadPorCarrera = {};
    egresados.forEach(eg => {
      const carrera = eg.carrera;
      if (!empleabilidadPorCarrera[carrera]) {
        empleabilidadPorCarrera[carrera] = { total: 0, empleados: 0 };
      }
      empleabilidadPorCarrera[carrera].total++;
      
      const tieneEmpleo = detalles.some(d => d.codigo_egresado === eg.codigo && d.estado === 'A');
      if (tieneEmpleo) {
        empleabilidadPorCarrera[carrera].empleados++;
      }
    });

    // 2. Distribución de sueldos
    const sueldosPorCarrera = {};
    detalles.forEach(det => {
      if (det.sueldo_actual) {
        const egresado = egresados.find(e => e.codigo === det.codigo_egresado);
        if (egresado) {
          const carrera = egresado.carrera;
          if (!sueldosPorCarrera[carrera]) {
            sueldosPorCarrera[carrera] = [];
          }
          sueldosPorCarrera[carrera].push(parseFloat(det.sueldo_actual));
        }
      }
    });

    // 3. Análisis geográfico
    const egresadosPorPais = {};
    const egresadosPorCiudad = {};
    detalles.forEach(det => {
      if (det.pais_residencia) {
        egresadosPorPais[det.pais_residencia] = (egresadosPorPais[det.pais_residencia] || 0) + 1;
      }
      if (det.ciudad_residencia) {
        egresadosPorCiudad[det.ciudad_residencia] = (egresadosPorCiudad[det.ciudad_residencia] || 0) + 1;
      }
    });

    // 4. Empresas más contratantes
    const empresasContratantes = {};
    detalles.forEach(det => {
      if (det.empresa_actual && det.empresa_actual !== 'OTRA') {
        empresasContratantes[det.empresa_actual] = (empresasContratantes[det.empresa_actual] || 0) + 1;
      }
    });

    // 5. Certificaciones más populares
    const certPopulares = {};
    certificaciones.forEach(cert => {
      certPopulares[cert.nombre] = (certPopulares[cert.nombre] || 0) + 1;
    });

    setStats({
      empleabilidadPorCarrera,
      sueldosPorCarrera,
      egresadosPorPais,
      egresadosPorCiudad,
      empresasContratantes,
      certPopulares
    });
  };

  const formatDataForChart = (data, limit = 10) => {
    return Object.entries(data)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="estadisticas-container">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="estadisticas-container">
      <div className="header-bar">
        <div className="header-title">ESTADÍSTICAS AVANZADAS</div>
        <div className="header-breadcrumb">ANÁLISIS <span className="breadcrumb-separator">&gt;</span> ESTADÍSTICAS</div>
      </div>

      <div className="estadisticas-header">
        <h1>Análisis Estadístico Avanzado</h1>
        <p>Estadísticas detalladas sobre empleabilidad, distribución geográfica, sueldos y certificaciones de egresados</p>
      </div>

      {/* Métricas Generales */}
      <div className="metricas-generales">
        <div className="metrica-card">
          <FaUsers className="metrica-icon" />
          <div className="metrica-content">
            <h3>Total Egresados</h3>
            <p>{egresados.length}</p>
          </div>
        </div>
        <div className="metrica-card">
          <FaBriefcase className="metrica-icon" />
          <div className="metrica-content">
            <h3>Empleados</h3>
            <p>{detalles.filter(d => d.estado === 'A').length}</p>
          </div>
        </div>
        <div className="metrica-card">
          <FaCertificate className="metrica-icon" />
          <div className="metrica-content">
            <h3>Certificaciones</h3>
            <p>{certificaciones.length}</p>
          </div>
        </div>
        <div className="metrica-card">
          <FaMapMarkerAlt className="metrica-icon" />
          <div className="metrica-content">
            <h3>Países</h3>
            <p>{Object.keys(stats.egresadosPorPais || {}).length}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Tasa de Empleabilidad por Carrera */}
        <div className="chart-card">
          <h3>Tasa de Empleabilidad por Carrera</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.empleabilidadPorCarrera || {}).map(([carrera, data]) => ({
              carrera,
              tasa: ((data.empleados / data.total) * 100).toFixed(1),
              empleados: data.empleados,
              total: data.total
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="carrera" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value}%`, 'Tasa de Empleabilidad']} />
              <Bar dataKey="tasa" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución Geográfica */}
        <div className="chart-card">
          <h3>Egresados por País</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formatDataForChart(stats.egresadosPorPais || {}, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formatDataForChart(stats.egresadosPorPais || {}, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Empresas más Contratantes */}
        <div className="chart-card">
          <h3>Empresas que más Contratan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatDataForChart(stats.empresasContratantes || {})}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Certificaciones más Populares */}
        <div className="chart-card">
          <h3>Certificaciones más Populares</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatDataForChart(stats.certPopulares || {})}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Análisis de Sueldos */}
        <div className="chart-card full-width">
          <h3>Distribución de Sueldos por Carrera</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={Object.entries(stats.sueldosPorCarrera || {}).map(([carrera, sueldos]) => ({
              carrera,
              promedio: sueldos.reduce((a, b) => a + b, 0) / sueldos.length,
              maximo: Math.max(...sueldos),
              minimo: Math.min(...sueldos)
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="carrera" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="promedio" fill="#8884d8" name="Promedio" />
              <Line type="monotone" dataKey="maximo" stroke="#ff7300" name="Máximo" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Resumen */}
      <div className="resumen-table">
        <h3>Resumen por Carrera</h3>
        <table>
          <thead>
            <tr>
              <th>Carrera</th>
              <th>Total Egresados</th>
              <th>Empleados</th>
              <th>Tasa Empleabilidad</th>
              <th>Sueldo Promedio</th>
              <th>Certificaciones</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.empleabilidadPorCarrera || {}).map(([carrera, data]) => {
              const sueldos = stats.sueldosPorCarrera[carrera] || [];
              const certs = certificaciones.filter(c => {
                const eg = egresados.find(e => e.codigo === c.codigo_egresado);
                return eg && eg.carrera === carrera;
              });
              
              return (
                <tr key={carrera}>
                  <td>{carrera}</td>
                  <td>{data.total}</td>
                  <td>{data.empleados}</td>
                  <td>{((data.empleados / data.total) * 100).toFixed(1)}%</td>
                  <td>
                    {sueldos.length > 0 
                      ? `S/ ${(sueldos.reduce((a, b) => a + b, 0) / sueldos.length).toFixed(0)}`
                      : 'N/A'
                    }
                  </td>
                  <td>{certs.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Estadisticas; 