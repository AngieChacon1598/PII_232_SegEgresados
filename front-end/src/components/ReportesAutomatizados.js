import React, { useState, useEffect } from 'react';
import { getConfiguracionReportes, enviarReporteManual, getVistaPreviaReporte, updateConfiguracionReportes } from '../services/api';
import { FaEnvelope, FaCog, FaEye, FaPaperPlane, FaClock, FaCalendarAlt } from 'react-icons/fa';
import './ReportesAutomatizados.css';

const ReportesAutomatizados = () => {
  const [configuracion, setConfiguracion] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tipoReporte, setTipoReporte] = useState('diario');
  const [emailsAdicionales, setEmailsAdicionales] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const response = await getConfiguracionReportes();
      setConfiguracion(response.data);
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setMessage('Error cargando configuración');
    }
  };

  const enviarReporteManual = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const emails = emailsAdicionales.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await enviarReporteManual(tipoReporte, emails);
      
      setMessage(response.data.message);
      setEmailsAdicionales('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error enviando reporte');
    } finally {
      setLoading(false);
    }
  };

  const generarVistaPrevia = async () => {
    setLoading(true);
    
    try {
      const response = await getVistaPreviaReporte(tipoReporte);
      setVistaPrevia(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error generando vista previa');
    } finally {
      setLoading(false);
    }
  };

  const actualizarConfiguracion = async (nuevaConfig) => {
    try {
      await updateConfiguracionReportes(nuevaConfig);
      setMessage('Configuración actualizada exitosamente');
      setShowConfig(false);
      cargarConfiguracion();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error actualizando configuración');
    }
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const nuevaConfig = {
      email_config: {
        smtp_server: formData.get('smtp_server'),
        email: formData.get('email'),
        from_name: formData.get('from_name')
      },
      report_config: {
        recipients: formData.get('recipients').split(',').map(email => email.trim()),
        schedule_daily: formData.get('schedule_daily'),
        schedule_weekly: formData.get('schedule_weekly'),
        schedule_mensual: formData.get('schedule_mensual')
      }
    };
    
    actualizarConfiguracion(nuevaConfig);
  };

  return (
    <div className="reportes-automatizados-container">
      <div className="header-bar">
        <div className="header-title">REPORTES AUTOMATIZADOS</div>
        <div className="header-breadcrumb">ANÁLISIS <span className="breadcrumb-separator">&gt;</span> REPORTES AUTOMATIZADOS</div>
      </div>

      <div className="reportes-header">
        <h1>📧 Sistema de Reportes Automatizados</h1>
        <p>Configura y envía reportes automáticos por email con estadísticas de egresados</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Panel de Envío Manual */}
      <div className="panel-card">
        <h2><FaPaperPlane /> Envío Manual de Reportes</h2>
        
        <div className="form-group">
          <label>Tipo de Reporte:</label>
          <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
            <option value="diario">📊 Reporte Diario</option>
            <option value="semanal">📈 Reporte Semanal</option>
            <option value="mensual">📋 Reporte Mensual</option>
          </select>
        </div>

        <div className="form-group">
          <label>Emails Adicionales (opcional):</label>
          <input
            type="text"
            placeholder="email1@ejemplo.com, email2@ejemplo.com"
            value={emailsAdicionales}
            onChange={(e) => setEmailsAdicionales(e.target.value)}
          />
          <small>Separar múltiples emails con comas</small>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-preview" 
            onClick={generarVistaPrevia}
            disabled={loading}
          >
            <FaEye /> Vista Previa
          </button>
          
          <button 
            className="btn btn-send" 
            onClick={enviarReporteManual}
            disabled={loading}
          >
            <FaEnvelope /> Enviar Reporte
          </button>
        </div>
      </div>

      {/* Configuración */}
      <div className="panel-card">
        <div className="panel-header">
          <h2><FaCog /> Configuración del Sistema</h2>
          <button 
            className="btn btn-config"
            onClick={() => setShowConfig(!showConfig)}
          >
            {showConfig ? 'Ocultar' : 'Editar'} Configuración
          </button>
        </div>

        {configuracion && (
          <div className="config-info">
            <div className="config-section">
              <h3>📧 Configuración de Email</h3>
              <p><strong>Servidor SMTP:</strong> {configuracion.email_config.smtp_server}</p>
              <p><strong>Email Remitente:</strong> {configuracion.email_config.email}</p>
              <p><strong>Nombre Remitente:</strong> {configuracion.email_config.from_name}</p>
            </div>

            <div className="config-section">
              <h3>📅 Programación Automática</h3>
              <p><strong>Reporte Diario:</strong> {configuracion.report_config.schedule_daily}</p>
              <p><strong>Reporte Semanal:</strong> {configuracion.report_config.schedule_weekly}</p>
              <p><strong>Reporte Mensual:</strong> {configuracion.report_config.schedule_monthly}</p>
            </div>

            <div className="config-section">
              <h3>👥 Destinatarios</h3>
              <ul>
                {configuracion.report_config.recipients.map((email, index) => (
                  <li key={index}>{email}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {showConfig && configuracion && (
          <form onSubmit={handleConfigSubmit} className="config-form">
            <div className="form-section">
              <h3>Configuración de Email</h3>
              <div className="form-group">
                <label>Servidor SMTP:</label>
                <input 
                  type="text" 
                  name="smtp_server" 
                  defaultValue={configuracion.email_config.smtp_server}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={configuracion.email_config.email}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nombre Remitente:</label>
                <input 
                  type="text" 
                  name="from_name" 
                  defaultValue={configuracion.email_config.from_name}
                  required 
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Destinatarios</h3>
              <div className="form-group">
                <label>Emails Destinatarios:</label>
                <textarea 
                  name="recipients" 
                  defaultValue={configuracion.report_config.recipients.join(', ')}
                  placeholder="email1@ejemplo.com, email2@ejemplo.com"
                  required 
                />
                <small>Separar múltiples emails con comas</small>
              </div>
            </div>

            <div className="form-section">
              <h3>Programación</h3>
              <div className="form-group">
                <label>Reporte Diario (HH:MM):</label>
                <input 
                  type="time" 
                  name="schedule_daily" 
                  defaultValue={configuracion.report_config.schedule_daily}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Reporte Semanal:</label>
                <select name="schedule_weekly" defaultValue={configuracion.report_config.schedule_weekly}>
                  <option value="monday 10:00">Lunes 10:00</option>
                  <option value="tuesday 10:00">Martes 10:00</option>
                  <option value="wednesday 10:00">Miércoles 10:00</option>
                  <option value="thursday 10:00">Jueves 10:00</option>
                  <option value="friday 10:00">Viernes 10:00</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reporte Mensual:</label>
                <select name="schedule_mensual" defaultValue={configuracion.report_config.schedule_monthly}>
                  <option value="1 11:00">Día 1 - 11:00</option>
                  <option value="5 11:00">Día 5 - 11:00</option>
                  <option value="10 11:00">Día 10 - 11:00</option>
                  <option value="15 11:00">Día 15 - 11:00</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-save">
                Guardar Configuración
              </button>
              <button 
                type="button" 
                className="btn btn-cancel"
                onClick={() => setShowConfig(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Vista Previa */}
      {vistaPrevia && (
        <div className="panel-card">
          <h2><FaEye /> Vista Previa del Reporte</h2>
          <div className="vista-previa">
            <div 
              className="reporte-html"
              dangerouslySetInnerHTML={{ __html: vistaPrevia.html }}
            />
          </div>
        </div>
      )}

      {/* Información del Sistema */}
      <div className="panel-card">
        <h2><FaClock /> Información del Sistema</h2>
        <div className="info-grid">
          <div className="info-item">
            <h3>🔄 Reportes Automáticos</h3>
            <p>El sistema envía reportes automáticamente según la programación configurada.</p>
          </div>
          <div className="info-item">
            <h3>📊 Contenido del Reporte</h3>
            <ul>
              <li>Estadísticas generales de egresados</li>
              <li>Distribución por carrera</li>
              <li>Tasa de empleabilidad</li>
              <li>Top empresas contratantes</li>
              <li>Certificaciones obtenidas</li>
            </ul>
          </div>
          <div className="info-item">
            <h3>⚙️ Configuración</h3>
            <p>Puedes personalizar los horarios de envío y los destinatarios según tus necesidades.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesAutomatizados; 