import React, { useEffect, useState } from 'react';
import { getReporteEgresadosPorEstado } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

const COLORS = ['#00C49F', '#FF8042'];
const ESTADO_LABELS = { 'A': 'Activo', 'I': 'Inactivo' };

const ReporteEgresadosPorEstado = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getReporteEgresadosPorEstado();
        // Mapear los estados a etiquetas legibles
        setData(response.data.map(d => ({ ...d, estado: ESTADO_LABELS[d.estado] || d.estado })));
      } catch (err) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;
  if (!data.length) return <p>No hay datos para mostrar.</p>;

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2 style={{ textAlign: 'center' }}>Egresados por Estado</h2>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            dataKey="cantidad"
            nameKey="estado"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ estado, percent }) => `${estado}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReporteEgresadosPorEstado; 