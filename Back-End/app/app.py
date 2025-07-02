from flask import Flask, request, jsonify, render_template, Response, send_file, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app.config import SQLALCHEMY_DATABASE_URI
import json
import re
from marshmallow import Schema, fields, validate, ValidationError
import requests
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from sqlalchemy.exc import SQLAlchemyError
import os
from werkzeug.utils import secure_filename
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import schedule
import threading
import time
from io import BytesIO
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Inicialización de la app Flask
app = Flask(__name__, static_folder='static', static_url_path='/')
CORS(app)

GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzI_811QN5p0WNsmcjpYxzfvLmMQJL6ZrkKFqKNqye9MSJQ6hVYbOVvOYnf1FYof74B/exec'

app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configuración de Email
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'email': 'angie.chacon.a@vallegrande.edu.pe',  # Cambiar por tu email
    'password': 'Angie7149',  # Cambiar por tu contraseña de aplicación
    'from_name': 'Sistema de Seguimiento de Egresados'
}

# Configuración de Reportes Automatizados
REPORT_CONFIG = {
    'recipients': ['admin@vallegrande.edu.pe', 'angie.chacon.a@vallegrande.edu.pe'],
    'schedule_daily': '09:00',
    'schedule_weekly': 'monday 10:00',
    'schedule_monthly': '1 11:00'
}

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads', 'certificaciones')
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Helper para validar archivos permitidos
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Función de validación de correo electrónico
def validar_correo(correo):
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(regex, correo) is not None

# Función de validación de teléfono (solo números y longitud de 9)
def validar_telefono(telefono):
    return telefono.isdigit() and len(telefono) == 9  # Ajusta según la longitud necesaria

# Función de validación de DNI (debe ser único)
def validar_dni(dni):
    return Egresado.query.filter_by(dni=dni).first() is None

# Función de validación de nombre (solo letras y no vacíos)
def validar_nombre_apellido(nombre):
    return bool(re.match("^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\\s]+$", nombre))

# Función de validación de código (debe ser único)
def validar_codigo(codigo):
    return Egresado.query.filter_by(codigo=codigo).first() is None

# Función de validación de código de egresado (debe existir)
def validar_codigo_egresado(codigo):
    return Egresado.query.filter_by(codigo=codigo).first() is not None

# Función de validación de sueldo (debe ser positivo)
def validar_sueldo(sueldo):
    return sueldo is None or sueldo >= 0

# Función de validación de fecha
def validar_fecha(fecha_str):
    if not fecha_str:
        return True
    try:
        datetime.strptime(fecha_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

# ========================================
# FUNCIONES DE REPORTES AUTOMATIZADOS
# ========================================

def generar_estadisticas_egresados():
    """Genera estadísticas completas de egresados"""
    try:
        # Obtener datos
        egresados = Egresado.query.all()
        detalles = DetalleEgresado.query.filter_by(estado='A').all()
        certificaciones = Certificacion.query.filter_by(estado='A').all()
        
        # Estadísticas básicas
        total_egresados = len(egresados)
        egresados_activos = len([e for e in egresados if e.estado == 'A'])
        egresados_empleados = len(detalles)
        total_certificaciones = len(certificaciones)
        
        # Por carrera
        carreras_stats = {}
        for eg in egresados:
            carrera = eg.carrera
            if carrera not in carreras_stats:
                carreras_stats[carrera] = {'total': 0, 'empleados': 0, 'certificaciones': 0}
            carreras_stats[carrera]['total'] += 1
            
            # Verificar si tiene empleo
            tiene_empleo = any(d.codigo_egresado == eg.codigo for d in detalles)
            if tiene_empleo:
                carreras_stats[carrera]['empleados'] += 1
            
            # Contar certificaciones
            certs = len([c for c in certificaciones if c.codigo_egresado == eg.codigo])
            carreras_stats[carrera]['certificaciones'] += certs
        
        # Top empresas
        empresas_count = {}
        for det in detalles:
            if det.empresa_actual and det.empresa_actual != 'OTRA':
                empresas_count[det.empresa_actual] = empresas_count.get(det.empresa_actual, 0) + 1
        
        top_empresas = sorted(empresas_count.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'total_egresados': total_egresados,
            'egresados_activos': egresados_activos,
            'egresados_empleados': egresados_empleados,
            'total_certificaciones': total_certificaciones,
            'tasa_empleabilidad': (egresados_empleados / total_egresados * 100) if total_egresados > 0 else 0,
            'carreras_stats': carreras_stats,
            'top_empresas': top_empresas,
            'fecha_reporte': datetime.now().strftime('%d/%m/%Y %H:%M')
        }
    except Exception as e:
        print(f"Error generando estadísticas: {e}")
        return None

def generar_html_reporte(stats):
    """Genera el HTML del reporte"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }}
            .header h1 {{ color: #2c3e50; margin: 0; }}
            .header p {{ color: #7f8c8d; margin: 5px 0; }}
            .stats-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }}
            .stat-card {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }}
            .stat-card h3 {{ margin: 0 0 10px 0; font-size: 0.9em; text-transform: uppercase; }}
            .stat-card .number {{ font-size: 2.5em; font-weight: bold; }}
            .table-container {{ margin: 20px 0; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
            th {{ background-color: #3498db; color: white; font-weight: bold; }}
            tr:hover {{ background-color: #f5f5f5; }}
            .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Reporte de Seguimiento de Egresados</h1>
                <p>Generado automáticamente el {stats['fecha_reporte']}</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Egresados</h3>
                    <div class="number">{stats['total_egresados']}</div>
                </div>
                <div class="stat-card">
                    <h3>Empleados</h3>
                    <div class="number">{stats['egresados_empleados']}</div>
                </div>
                <div class="stat-card">
                    <h3>Tasa Empleabilidad</h3>
                    <div class="number">{stats['tasa_empleabilidad']:.1f}%</div>
                </div>
                <div class="stat-card">
                    <h3>Certificaciones</h3>
                    <div class="number">{stats['total_certificaciones']}</div>
                </div>
            </div>
            
            <div class="table-container">
                <h2>📈 Estadísticas por Carrera</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Carrera</th>
                            <th>Total Egresados</th>
                            <th>Empleados</th>
                            <th>Tasa Empleabilidad</th>
                            <th>Certificaciones</th>
                        </tr>
                    </thead>
                    <tbody>
    """
    
    for carrera, data in stats['carreras_stats'].items():
        tasa = (data['empleados'] / data['total'] * 100) if data['total'] > 0 else 0
        html += f"""
                        <tr>
                            <td><strong>{carrera}</strong></td>
                            <td>{data['total']}</td>
                            <td>{data['empleados']}</td>
                            <td>{tasa:.1f}%</td>
                            <td>{data['certificaciones']}</td>
                        </tr>
        """
    
    html += """
                    </tbody>
                </table>
            </div>
            
            <div class="table-container">
                <h2>🏢 Top Empresas Contratantes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Empresa</th>
                            <th>Egresados Contratados</th>
                        </tr>
                    </thead>
                    <tbody>
    """
    
    for empresa, cantidad in stats['top_empresas']:
        html += f"""
                        <tr>
                            <td>{empresa}</td>
                            <td>{cantidad}</td>
                        </tr>
        """
    
    html += """
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                <p>Este reporte fue generado automáticamente por el Sistema de Seguimiento de Egresados</p>
                <p>Para más información, contacte al administrador del sistema</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html

def enviar_email_reporte(recipients, subject, html_content):
    """Envía email con reporte"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{EMAIL_CONFIG['from_name']} <{EMAIL_CONFIG['email']}>"
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = subject
        
        # Agregar contenido HTML
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Conectar y enviar
        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        server.starttls()
        server.login(EMAIL_CONFIG['email'], EMAIL_CONFIG['password'])
        
        text = msg.as_string()
        server.sendmail(EMAIL_CONFIG['email'], recipients, text)
        server.quit()
        
        print(f"Email enviado exitosamente a {recipients}")
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False

def generar_y_enviar_reporte(tipo_reporte="diario", recipients=None):
    """Función principal para generar y enviar reporte"""
    try:
        print(f"Generando reporte {tipo_reporte}...")
        # Generar estadísticas
        stats = generar_estadisticas_egresados()
        if not stats:
            print("Error generando estadísticas")
            return False
        # Generar HTML
        html_content = generar_html_reporte(stats)
        # Configurar asunto según tipo
        asuntos = {
            "diario": "📊 Reporte Diario - Seguimiento de Egresados",
            "semanal": "📈 Reporte Semanal - Seguimiento de Egresados", 
            "mensual": "📋 Reporte Mensual - Seguimiento de Egresados"
        }
        subject = asuntos.get(tipo_reporte, "📊 Reporte - Seguimiento de Egresados")
        # Usar recipients proporcionados o los de configuración
        if recipients is None:
            recipients = REPORT_CONFIG['recipients']
        # Enviar email
        success = enviar_email_reporte(
            recipients,
            subject,
            html_content
        )
        if success:
            print(f"Reporte {tipo_reporte} enviado exitosamente")
        else:
            print(f"Error enviando reporte {tipo_reporte}")
        return success
    except Exception as e:
        print(f"Error en generar_y_enviar_reporte: {e}")
        return False

# Modelo de Egresado
class Egresado(db.Model):
    __tablename__ = 'egresado'

    codigo = db.Column(db.String(20), primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(8), unique=True, nullable=False)
    correo = db.Column(db.String(120), unique=True, nullable=False)
    telefono = db.Column(db.String(15))
    carrera = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(1), nullable=False)  # A = activo, I = inactivo

    def to_dict(self):
        return {
            'codigo': self.codigo,
            'nombre': self.nombre,
            'apellidos': self.apellidos,
            'dni': self.dni,
            'correo': self.correo,
            'telefono': self.telefono,
            'carrera': self.carrera,
            'estado': self.estado
        }

# Modelo de Detalle Egresado
class DetalleEgresado(db.Model):
    __tablename__ = 'detalle_egresado'

    id_detalle = db.Column(db.Integer, primary_key=True, autoincrement=True)
    codigo_egresado = db.Column(db.String(20), db.ForeignKey('egresado.codigo'), nullable=False)
    fecha_egreso = db.Column(db.Date)
    empresa_actual = db.Column(db.String(100))
    cargo_actual = db.Column(db.String(100))
    pais_residencia = db.Column(db.String(50))
    ciudad_residencia = db.Column(db.String(50))
    fecha_incorporacion = db.Column(db.Date)
    area_trabajo = db.Column(db.String(50))
    sueldo_actual = db.Column(db.Numeric(10, 2))
    estado = db.Column(db.String(1), nullable=False, default='A')  # A = activo, I = inactivo

    # Relación con Egresado
    egresado = db.relationship('Egresado', backref='detalles')

    def to_dict(self):
        return {
            'id_detalle': self.id_detalle,
            'codigo_egresado': self.codigo_egresado,
            'fecha_egreso': self.fecha_egreso.isoformat() if self.fecha_egreso else None,
            'empresa_actual': self.empresa_actual,
            'cargo_actual': self.cargo_actual,
            'pais_residencia': self.pais_residencia,
            'ciudad_residencia': self.ciudad_residencia,
            'fecha_incorporacion': self.fecha_incorporacion.isoformat() if self.fecha_incorporacion else None,
            'area_trabajo': self.area_trabajo,
            'sueldo_actual': float(self.sueldo_actual) if self.sueldo_actual else None,
            'estado': self.estado,
            'egresado_nombre': f"{self.egresado.nombre} {self.egresado.apellidos}" if self.egresado else None
        }

# Modelo de Certificacion
class Certificacion(db.Model):
    __tablename__ = 'certificacion'

    id_certificacion = db.Column(db.Integer, primary_key=True, autoincrement=True)
    codigo_egresado = db.Column(db.String(20), db.ForeignKey('egresado.codigo'), nullable=False)
    nombre = db.Column(db.String(150), nullable=False)
    institucion = db.Column(db.String(150), nullable=False)
    fecha_obtencion = db.Column(db.Date, nullable=False)
    archivo = db.Column(db.String(255))
    estado = db.Column(db.String(1), nullable=False, default='A')  # A = activo, I = inactivo

    # Relación con Egresado
    egresado = db.relationship('Egresado', backref='certificaciones')

    def to_dict(self):
        return {
            'id_certificacion': self.id_certificacion,
            'codigo_egresado': self.codigo_egresado,
            'nombre': self.nombre,
            'institucion': self.institucion,
            'fecha_obtencion': self.fecha_obtencion.isoformat() if self.fecha_obtencion else None,
            'archivo': self.archivo,
            'estado': self.estado
        }

# Schema de Marshmallow para validaciones de Egresado
class EgresadoSchema(Schema):
    codigo = fields.String(required=True)
    nombre = fields.String(required=True, validate=validate.Length(min=1))
    apellidos = fields.String(required=True, validate=validate.Length(min=1))
    dni = fields.String(required=True, validate=validate.Length(equal=8))  # Validar longitud del DNI
    correo = fields.Email(required=True)
    telefono = fields.String(validate=validate.Length(equal=9))  # Validar longitud de teléfono
    carrera = fields.String(required=True)
    estado = fields.String(validate=validate.OneOf(["A", "I"]))

# Schema de Marshmallow para validaciones de Detalle Egresado
class DetalleEgresadoSchema(Schema):
    codigo_egresado = fields.String(required=True)
    fecha_egreso = fields.Date(allow_none=True)
    empresa_actual = fields.String(allow_none=True)
    cargo_actual = fields.String(allow_none=True)
    pais_residencia = fields.String(allow_none=True)
    ciudad_residencia = fields.String(allow_none=True)
    fecha_incorporacion = fields.Date(allow_none=True)
    area_trabajo = fields.String(allow_none=True)
    sueldo_actual = fields.Decimal(allow_none=True)
    estado = fields.String(validate=validate.OneOf(["A", "I"]), load_default="A")

# Ruta para obtener todos los egresados (JSON)
@app.route('/egresados', methods=['GET'])
def get_egresados():
    estado = request.args.get('estado')
    apellidos = request.args.get('apellidos', '').strip()
    dni = request.args.get('dni', '').strip()
    carrera = request.args.get('carrera', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = Egresado.query
    
    # Aplicar filtros
    if estado:
        query = query.filter_by(estado=estado)
    
    if apellidos:
        query = query.filter(Egresado.apellidos.ilike(f'%{apellidos}%'))
    
    if dni:
        query = query.filter(Egresado.dni.ilike(f'%{dni}%'))
    
    if carrera:
        query = query.filter(Egresado.carrera.ilike(f'%{carrera}%'))
    
    pagination = query.order_by(Egresado.codigo).paginate(page=page, per_page=per_page, error_out=False)
    egresados_list = [e.to_dict() for e in pagination.items]
    return jsonify({
        'egresados': egresados_list,
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    })

# Ruta para mostrar los egresados en formato HTML
@app.route('/egresados/html', methods=['GET'])
def listar_egresados_html():
    estado = request.args.get('estado')  # Filtro por estado (activo/inactivo)
    page = request.args.get('page', 1, type=int)  # Paginación (si es necesario)
    per_page = 10  # Número de registros por página

    # Filtros y paginación
    if estado:
        egresados = Egresado.query.filter_by(estado=estado).paginate(page, per_page, False)
    else:
        egresados = Egresado.query.paginate(page=page, per_page=per_page, error_out=False)

    # Pasar los egresados a la plantilla HTML
    return render_template('egresados.html', egresados=egresados.items, prev_url=egresados.prev_num, next_url=egresados.next_num)

# Ruta para crear un nuevo egresado (POST)
@app.route('/egresados', methods=['POST'])
def create_egresado():
    data = request.get_json()

    # Validar datos usando Marshmallow
    schema = EgresadoSchema()
    try:
        schema.load(data)
    except ValidationError as err:
        return jsonify({'message': 'Error de validación', 'errors': err.messages}), 400

    # Validar DNI único
    if not validar_dni(data['dni']):
        return jsonify({'message': 'El DNI ya está registrado.'}), 400

    # Validar Código único
    if not validar_codigo(data['codigo']):
        return jsonify({'message': 'El código ya está registrado.'}), 400

    # Validar correo electrónico
    if not validar_correo(data['correo']):
        return jsonify({'message': 'Correo electrónico inválido.'}), 400

    # Validar teléfono
    if data.get('telefono') and not validar_telefono(data['telefono']):
        return jsonify({'message': 'Número de teléfono inválido. Debe contener solo números y tener 9 dígitos.'}), 400

    # Validar nombre y apellidos (solo letras y sin números)
    if not validar_nombre_apellido(data['nombre']):
        return jsonify({'message': 'El nombre contiene caracteres no válidos.'}), 400
    if not validar_nombre_apellido(data['apellidos']):
        return jsonify({'message': 'Los apellidos contienen caracteres no válidos.'}), 400

    # Crear un nuevo egresado
    nuevo_egresado = Egresado(
        codigo=data['codigo'],
        nombre=data['nombre'],
        apellidos=data['apellidos'],
        dni=data['dni'],
        correo=data['correo'],
        telefono=data.get('telefono', ''),
        carrera=data['carrera'],
        estado=data.get('estado', 'A')
    )

    db.session.add(nuevo_egresado)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al registrar el egresado', 'error': str(e)}), 500

    return jsonify(nuevo_egresado.to_dict()), 201

# Ruta para actualizar un egresado (PUT)
@app.route('/egresados/<string:codigo>', methods=['PUT'])
def update_egresado(codigo):
    data = request.get_json()
    egresado = Egresado.query.get(codigo)
    if not egresado:
        return jsonify({'message': 'Egresado no encontrado'}), 404

    # Validar los cambios antes de actualizarlos
    if 'correo' in data and not validar_correo(data['correo']):
        return jsonify({'message': 'Correo electrónico inválido.'}), 400

    if 'telefono' in data and not validar_telefono(data['telefono']):
        return jsonify({'message': 'Número de teléfono inválido. Debe contener solo números y tener 9 dígitos.'}), 400

    if 'nombre' in data and not validar_nombre_apellido(data['nombre']):
        return jsonify({'message': 'El nombre contiene caracteres no válidos.'}), 400

    if 'apellidos' in data and not validar_nombre_apellido(data['apellidos']):
        return jsonify({'message': 'Los apellidos contienen caracteres no válidos.'}), 400

    # Actualizar los datos
    egresado.nombre = data.get('nombre', egresado.nombre)
    egresado.apellidos = data.get('apellidos', egresado.apellidos)
    egresado.dni = data.get('dni', egresado.dni)
    egresado.correo = data.get('correo', egresado.correo)
    egresado.telefono = data.get('telefono', egresado.telefono)
    egresado.carrera = data.get('carrera', egresado.carrera)
    egresado.estado = data.get('estado', egresado.estado)

    db.session.commit()
    return jsonify(egresado.to_dict())

@app.route('/egresados/<string:codigo>', methods=['GET'])
def get_egresado(codigo):
    egresado = Egresado.query.get(codigo)
    if not egresado:
        return jsonify({'message': 'Egresado no encontrado'}), 404
    return jsonify(egresado.to_dict())

# Ruta para eliminar un egresado lógicamente (DELETE)
@app.route('/egresados/<string:codigo>', methods=['DELETE'])
def delete_egresado_logico(codigo):
    egresado = Egresado.query.get(codigo)
    if not egresado:
        return jsonify({'message': 'Egresado no encontrado'}), 404

    egresado.estado = 'I'
    db.session.commit()
    return jsonify({'message': 'Egresado eliminado lógicamente', 'egresado': egresado.to_dict()}), 200

# Ruta para restaurar un egresado (PUT)
@app.route('/egresados/restaurar/<string:codigo>', methods=['PUT'])
def restaurar_egresado(codigo):
    egresado = Egresado.query.get(codigo)
    if not egresado:
        return jsonify({'message': 'Egresado no encontrado'}), 404

    if egresado.estado != 'I':
        return jsonify({'message': 'Este egresado no está eliminado lógicamente'}), 400

    egresado.estado = 'A'
    db.session.commit()
    return jsonify({'message': 'Egresado restaurado', 'egresado': egresado.to_dict()}), 200

# Ruta para eliminar físicamente un egresado (DELETE)
@app.route('/egresados/fisico/<string:codigo>', methods=['DELETE'])
def delete_egresado_fisico(codigo):
    egresado = Egresado.query.get(codigo)
    if not egresado:
        return jsonify({'message': 'Egresado no encontrado'}), 404

    db.session.delete(egresado)
    db.session.commit()
    return jsonify({'message': 'Egresado eliminado físicamente'}), 200

# Rutas Adicionales

@app.route('/api/encuestas', methods=['POST', 'OPTIONS'])
def proxy_encuestas():
    if request.method == 'OPTIONS':
        response = app.make_response('')
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    data = request.get_json()
    try:
        gs_response = requests.post(
            GOOGLE_SCRIPT_URL,
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        gs_response.raise_for_status()
        return jsonify(gs_response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'result': 'error', 'message': str(e)}), 500

# ========================================
# ENDPOINTS PARA DETALLE_EGRESADO
# ========================================

# Ruta para obtener todos los detalles de egresados (JSON)
@app.route('/detalle-egresados', methods=['GET'])
def get_detalle_egresados():
    estado = request.args.get('estado')
    codigo_egresado = request.args.get('codigo_egresado')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = DetalleEgresado.query
    
    if estado:
        query = query.filter_by(estado=estado)
    if codigo_egresado:
        query = query.filter_by(codigo_egresado=codigo_egresado)
    
    pagination = query.order_by(DetalleEgresado.id_detalle).paginate(page=page, per_page=per_page, error_out=False)
    detalles_list = [d.to_dict() for d in pagination.items]
    return jsonify({
        'detalles': detalles_list,
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    })

# Ruta para obtener un detalle específico
@app.route('/detalle-egresados/<int:id_detalle>', methods=['GET'])
def get_detalle_egresado(id_detalle):
    detalle = DetalleEgresado.query.get(id_detalle)
    if not detalle:
        return jsonify({'message': 'Detalle de egresado no encontrado'}), 404
    return jsonify(detalle.to_dict())

# Ruta para crear un nuevo detalle de egresado (POST)
@app.route('/detalle-egresados', methods=['POST'])
def create_detalle_egresado():
    data = request.get_json()

    # Validar datos usando Marshmallow
    schema = DetalleEgresadoSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({'message': 'Error de validación', 'errors': err.messages}), 400

    # Validar que el código de egresado existe
    if not validar_codigo_egresado(validated_data['codigo_egresado']):
        return jsonify({'message': 'El código de egresado no existe.'}), 400

    # Validar sueldo
    if 'sueldo_actual' in validated_data and not validar_sueldo(validated_data['sueldo_actual']):
        return jsonify({'message': 'El sueldo debe ser un valor positivo.'}), 400

    # Validar fechas
    if 'fecha_egreso' in validated_data and validated_data['fecha_egreso']:
        if not validar_fecha(validated_data['fecha_egreso'].strftime('%Y-%m-%d')):
            return jsonify({'message': 'Formato de fecha de egreso inválido.'}), 400
    
    if 'fecha_incorporacion' in validated_data and validated_data['fecha_incorporacion']:
        if not validar_fecha(validated_data['fecha_incorporacion'].strftime('%Y-%m-%d')):
            return jsonify({'message': 'Formato de fecha de incorporación inválido.'}), 400

    # Crear un nuevo detalle de egresado
    nuevo_detalle = DetalleEgresado(
        codigo_egresado=validated_data['codigo_egresado'],
        fecha_egreso=validated_data.get('fecha_egreso'),
        empresa_actual=validated_data.get('empresa_actual'),
        cargo_actual=validated_data.get('cargo_actual'),
        pais_residencia=validated_data.get('pais_residencia'),
        ciudad_residencia=validated_data.get('ciudad_residencia'),
        fecha_incorporacion=validated_data.get('fecha_incorporacion'),
        area_trabajo=validated_data.get('area_trabajo'),
        sueldo_actual=validated_data.get('sueldo_actual'),
        estado=validated_data.get('estado', 'A')
    )

    db.session.add(nuevo_detalle)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al registrar el detalle de egresado', 'error': str(e)}), 500

    return jsonify(nuevo_detalle.to_dict()), 201

# Ruta para actualizar un detalle de egresado (PUT)
@app.route('/detalle-egresados/<int:id_detalle>', methods=['PUT'])
def update_detalle_egresado(id_detalle):
    data = request.get_json()
    detalle = DetalleEgresado.query.get(id_detalle)
    if not detalle:
        return jsonify({'message': 'Detalle de egresado no encontrado'}), 404

    # Validar código de egresado si se está actualizando
    if 'codigo_egresado' in data and not validar_codigo_egresado(data['codigo_egresado']):
        return jsonify({'message': 'El código de egresado no existe.'}), 400

    # Validar sueldo
    if 'sueldo_actual' in data and not validar_sueldo(data['sueldo_actual']):
        return jsonify({'message': 'El sueldo debe ser un valor positivo.'}), 400

    # Validar fechas
    if 'fecha_egreso' in data and data['fecha_egreso']:
        if not validar_fecha(data['fecha_egreso']):
            return jsonify({'message': 'Formato de fecha de egreso inválido.'}), 400
    
    if 'fecha_incorporacion' in data and data['fecha_incorporacion']:
        if not validar_fecha(data['fecha_incorporacion']):
            return jsonify({'message': 'Formato de fecha de incorporación inválido.'}), 400

    # Actualizar los datos
    if 'codigo_egresado' in data:
        detalle.codigo_egresado = data['codigo_egresado']
    if 'fecha_egreso' in data:
        detalle.fecha_egreso = datetime.strptime(data['fecha_egreso'], '%Y-%m-%d').date() if data['fecha_egreso'] else None
    if 'empresa_actual' in data:
        detalle.empresa_actual = data['empresa_actual']
    if 'cargo_actual' in data:
        detalle.cargo_actual = data['cargo_actual']
    if 'pais_residencia' in data:
        detalle.pais_residencia = data['pais_residencia']
    if 'ciudad_residencia' in data:
        detalle.ciudad_residencia = data['ciudad_residencia']
    if 'fecha_incorporacion' in data:
        detalle.fecha_incorporacion = datetime.strptime(data['fecha_incorporacion'], '%Y-%m-%d').date() if data['fecha_incorporacion'] else None
    if 'area_trabajo' in data:
        detalle.area_trabajo = data['area_trabajo']
    if 'sueldo_actual' in data:
        detalle.sueldo_actual = data['sueldo_actual']
    if 'estado' in data:
        detalle.estado = data['estado']

    db.session.commit()
    return jsonify(detalle.to_dict())

# Ruta para eliminar un detalle de egresado lógicamente (DELETE)
@app.route('/detalle-egresados/<int:id_detalle>', methods=['DELETE'])
def delete_detalle_egresado_logico(id_detalle):
    detalle = DetalleEgresado.query.get(id_detalle)
    if not detalle:
        return jsonify({'message': 'Detalle de egresado no encontrado'}), 404

    detalle.estado = 'I'
    db.session.commit()
    return jsonify({'message': 'Detalle de egresado eliminado lógicamente', 'detalle': detalle.to_dict()}), 200

# Ruta para restaurar un detalle de egresado (PUT)
@app.route('/detalle-egresados/restaurar/<int:id_detalle>', methods=['PUT'])
def restaurar_detalle_egresado(id_detalle):
    detalle = DetalleEgresado.query.get(id_detalle)
    if not detalle:
        return jsonify({'message': 'Detalle de egresado no encontrado'}), 404

    if detalle.estado != 'I':
        return jsonify({'message': 'Este detalle de egresado no está eliminado lógicamente'}), 400

    detalle.estado = 'A'
    db.session.commit()
    return jsonify({'message': 'Detalle de egresado restaurado', 'detalle': detalle.to_dict()}), 200

# Ruta para eliminar físicamente un detalle de egresado (DELETE)
@app.route('/detalle-egresados/fisico/<int:id_detalle>', methods=['DELETE'])
def delete_detalle_egresado_fisico(id_detalle):
    detalle = DetalleEgresado.query.get(id_detalle)
    if not detalle:
        return jsonify({'message': 'Detalle de egresado no encontrado'}), 404

    db.session.delete(detalle)
    db.session.commit()
    return jsonify({'message': 'Detalle de egresado eliminado físicamente'}), 200

# =============================
# ENDPOINTS DE REPORTES
# =============================

@app.route('/api/reportes/egresados-por-carrera')
def egresados_por_carrera():
    resultados = db.session.query(
        Egresado.carrera, func.count(Egresado.codigo)
    ).group_by(Egresado.carrera).all()
    data = [{'carrera': r[0], 'cantidad': r[1]} for r in resultados]
    return jsonify(data)

@app.route('/api/reportes/egresados-por-estado')
def egresados_por_estado():
    resultados = db.session.query(
        Egresado.estado, func.count(Egresado.codigo)
    ).group_by(Egresado.estado).all()
    data = [{'estado': r[0], 'cantidad': r[1]} for r in resultados]
    return jsonify(data)

@app.route('/api/reportes/egresados-por-anio')
def egresados_por_anio():
    resultados = db.session.query(
        extract('year', DetalleEgresado.fecha_egreso), func.count(DetalleEgresado.id_detalle)
    ).group_by(extract('year', DetalleEgresado.fecha_egreso)).all()
    data = [{'anio': int(r[0]) if r[0] else 'Sin año', 'cantidad': r[1]} for r in resultados]
    return jsonify(data)

@app.route('/api/egresados/<string:codigo>/nuevo-empleo', methods=['POST'])
def registrar_nuevo_empleo(codigo):
    data = request.get_json()
    egresado = Egresado.query.get(codigo)
    if not egresado:
        return jsonify({'message': 'Egresado no encontrado'}), 404

    # Validar datos mínimos requeridos
    required_fields = ['fecha_egreso', 'empresa_actual', 'cargo_actual', 'pais_residencia', 'ciudad_residencia', 'fecha_incorporacion', 'area_trabajo', 'sueldo_actual']
    for field in required_fields:
        if field not in data or data[field] in [None, '']:
            return jsonify({'message': f'El campo {field} es obligatorio.'}), 400

    try:
        # Iniciar transacción
        nuevo_detalle = DetalleEgresado(
            codigo_egresado=codigo,
            fecha_egreso=datetime.strptime(data['fecha_egreso'], '%Y-%m-%d').date() if data.get('fecha_egreso') else None,
            empresa_actual=data.get('empresa_actual'),
            cargo_actual=data.get('cargo_actual'),
            pais_residencia=data.get('pais_residencia'),
            ciudad_residencia=data.get('ciudad_residencia'),
            fecha_incorporacion=datetime.strptime(data['fecha_incorporacion'], '%Y-%m-%d').date() if data.get('fecha_incorporacion') else None,
            area_trabajo=data.get('area_trabajo'),
            sueldo_actual=data.get('sueldo_actual'),
            estado='A'
        )
        db.session.add(nuevo_detalle)
        # Actualizar estado del egresado a 'A'
        egresado.estado = 'A'
        db.session.commit()
        return jsonify({'message': 'Nuevo empleo registrado exitosamente', 'detalle': nuevo_detalle.to_dict()}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Error al registrar el nuevo empleo', 'error': str(e)}), 500

# Ruta para obtener carreras únicas
@app.route('/carreras', methods=['GET'])
def get_carreras():
    try:
        carreras = db.session.query(Egresado.carrera).distinct().filter_by(estado='A').all()
        carreras_list = [carrera[0] for carrera in carreras if carrera[0]]
        return jsonify({'carreras': sorted(carreras_list)})
    except Exception as e:
        return jsonify({'message': 'Error al obtener las carreras', 'error': str(e)}), 500

# Modelo de Empresa
class Empresa(db.Model):
    __tablename__ = 'empresa'

    id_empresa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    ruc = db.Column(db.String(11), unique=True, nullable=False)
    direccion = db.Column(db.String(200))
    telefono = db.Column(db.String(15))
    correo = db.Column(db.String(120))
    estado = db.Column(db.String(1), nullable=False, default='A')  # A = activo, I = inactivo

    def to_dict(self):
        return {
            'id_empresa': self.id_empresa,
            'nombre': self.nombre,
            'ruc': self.ruc,
            'direccion': self.direccion,
            'telefono': self.telefono,
            'correo': self.correo,
            'estado': self.estado
        }

# CRUD Empresa
@app.route('/empresas', methods=['GET'])
def get_empresas():
    estado = request.args.get('estado')
    nombre = request.args.get('nombre', '').strip()
    ruc = request.args.get('ruc', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    query = Empresa.query
    if estado:
        query = query.filter_by(estado=estado)
    if nombre:
        query = query.filter(Empresa.nombre.ilike(f'%{nombre}%'))
    if ruc:
        query = query.filter(Empresa.ruc.ilike(f'%{ruc}%'))
    pagination = query.order_by(Empresa.id_empresa).paginate(page=page, per_page=per_page, error_out=False)
    empresas = [e.to_dict() for e in pagination.items]
    return jsonify({
        'empresas': empresas,
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    })

@app.route('/empresas/<int:id_empresa>', methods=['GET'])
def get_empresa(id_empresa):
    empresa = Empresa.query.get(id_empresa)
    if not empresa:
        return jsonify({'message': 'Empresa no encontrada'}), 404
    return jsonify(empresa.to_dict())

@app.route('/empresas', methods=['POST'])
def create_empresa():
    data = request.get_json()
    if not data.get('nombre') or not data.get('ruc'):
        return jsonify({'message': 'Nombre y RUC son obligatorios'}), 400
    if len(data['ruc']) != 11 or not data['ruc'].isdigit():
        return jsonify({'message': 'El RUC debe tener 11 dígitos numéricos'}), 400
    if Empresa.query.filter_by(ruc=data['ruc']).first():
        return jsonify({'message': 'El RUC ya está registrado'}), 400
    if Empresa.query.filter_by(nombre=data['nombre']).first():
        return jsonify({'message': 'El nombre ya está registrado'}), 400
    empresa = Empresa(
        nombre=data['nombre'],
        ruc=data['ruc'],
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        correo=data.get('correo'),
        estado='A'
    )
    db.session.add(empresa)
    db.session.commit()
    return jsonify(empresa.to_dict()), 201

@app.route('/empresas/<int:id_empresa>', methods=['PUT'])
def update_empresa(id_empresa):
    empresa = Empresa.query.get(id_empresa)
    if not empresa:
        return jsonify({'message': 'Empresa no encontrada'}), 404
    data = request.get_json()
    if 'nombre' in data:
        if Empresa.query.filter(Empresa.nombre == data['nombre'], Empresa.id_empresa != id_empresa).first():
            return jsonify({'message': 'El nombre ya está registrado'}), 400
        empresa.nombre = data['nombre']
    if 'ruc' in data:
        if len(data['ruc']) != 11 or not data['ruc'].isdigit():
            return jsonify({'message': 'El RUC debe tener 11 dígitos numéricos'}), 400
        if Empresa.query.filter(Empresa.ruc == data['ruc'], Empresa.id_empresa != id_empresa).first():
            return jsonify({'message': 'El RUC ya está registrado'}), 400
        empresa.ruc = data['ruc']
    if 'direccion' in data:
        empresa.direccion = data['direccion']
    if 'telefono' in data:
        empresa.telefono = data['telefono']
    if 'correo' in data:
        empresa.correo = data['correo']
    db.session.commit()
    return jsonify(empresa.to_dict())

@app.route('/empresas/<int:id_empresa>', methods=['DELETE'])
def delete_empresa(id_empresa):
    empresa = Empresa.query.get(id_empresa)
    if not empresa:
        return jsonify({'message': 'Empresa no encontrada'}), 404
    empresa.estado = 'I'
    db.session.commit()
    return jsonify({'message': 'Empresa eliminada lógicamente', 'empresa': empresa.to_dict()})

@app.route('/empresas/restaurar/<int:id_empresa>', methods=['PUT'])
def restaurar_empresa(id_empresa):
    empresa = Empresa.query.get(id_empresa)
    if not empresa:
        return jsonify({'message': 'Empresa no encontrada'}), 404
    if empresa.estado != 'I':
        return jsonify({'message': 'La empresa no está eliminada lógicamente'}), 400
    empresa.estado = 'A'
    db.session.commit()
    return jsonify({'message': 'Empresa restaurada', 'empresa': empresa.to_dict()})

# =============================
# ENDPOINTS DE CERTIFICACIONES
# =============================

# Listar certificaciones por egresado
@app.route('/certificaciones', methods=['GET'])
def listar_certificaciones():
    codigo_egresado = request.args.get('codigo_egresado')
    query = Certificacion.query.filter_by(estado='A')
    if codigo_egresado:
        query = query.filter_by(codigo_egresado=codigo_egresado)
    certificaciones = query.order_by(Certificacion.fecha_obtencion.desc()).all()
    return jsonify({'certificaciones': [c.to_dict() for c in certificaciones]})

# Agregar nueva certificación (con o sin archivo)
@app.route('/certificaciones', methods=['POST'])
def agregar_certificacion():
    data = request.form
    file = request.files.get('archivo')
    codigo_egresado = data.get('codigo_egresado')
    nombre = data.get('nombre')
    institucion = data.get('institucion')
    fecha_obtencion = data.get('fecha_obtencion')
    estado = data.get('estado', 'A')
    archivo_nombre = None
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        archivo_nombre = f"{codigo_egresado}_{int(datetime.now().timestamp())}_{filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], archivo_nombre))
    nueva = Certificacion(
        codigo_egresado=codigo_egresado,
        nombre=nombre,
        institucion=institucion,
        fecha_obtencion=datetime.strptime(fecha_obtencion, '%Y-%m-%d').date() if fecha_obtencion else None,
        archivo=archivo_nombre,
        estado=estado
    )
    db.session.add(nueva)
    db.session.commit()
    return jsonify(nueva.to_dict()), 201

# Editar certificación
@app.route('/certificaciones/<int:id_certificacion>', methods=['PUT'])
def editar_certificacion(id_certificacion):
    cert = Certificacion.query.get(id_certificacion)
    if not cert:
        return jsonify({'message': 'Certificación no encontrada'}), 404
    data = request.form
    file = request.files.get('archivo')
    if 'nombre' in data:
        cert.nombre = data['nombre']
    if 'institucion' in data:
        cert.institucion = data['institucion']
    if 'fecha_obtencion' in data:
        cert.fecha_obtencion = datetime.strptime(data['fecha_obtencion'], '%Y-%m-%d').date()
    if 'estado' in data:
        cert.estado = data['estado']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        archivo_nombre = f"{cert.codigo_egresado}_{int(datetime.now().timestamp())}_{filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], archivo_nombre))
        cert.archivo = archivo_nombre
    db.session.commit()
    return jsonify(cert.to_dict())

# Eliminar físicamente una certificación
@app.route('/certificaciones/<int:id_certificacion>', methods=['DELETE'])
def eliminar_certificacion(id_certificacion):
    cert = Certificacion.query.get(id_certificacion)
    if not cert:
        return jsonify({'message': 'Certificación no encontrada'}), 404
    db.session.delete(cert)
    db.session.commit()
    return jsonify({'message': 'Certificación eliminada físicamente'}), 200

# Descargar archivo de certificación
@app.route('/certificaciones/<int:id_certificacion>/archivo', methods=['GET'])
def descargar_archivo_certificacion(id_certificacion):
    certificacion = Certificacion.query.get(id_certificacion)
    if not certificacion or not certificacion.archivo:
        return jsonify({'message': 'Archivo no encontrado'}), 404
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], certificacion.archivo)
    if not os.path.exists(file_path):
        return jsonify({'message': 'Archivo no encontrado en el servidor'}), 404
    
    return send_file(file_path, as_attachment=True)

# ========================================
# ENDPOINTS PARA REPORTES AUTOMATIZADOS
# ========================================

@app.route('/api/reportes/enviar-manual', methods=['POST'])
def enviar_reporte_manual():
    """Endpoint para enviar reporte manualmente"""
    try:
        data = request.get_json()
        tipo_reporte = data.get('tipo', 'diario')
        emails_adicionales = data.get('emails', [])
        # Combinar emails configurados con adicionales
        recipients = REPORT_CONFIG['recipients'] + emails_adicionales
        success = generar_y_enviar_reporte(tipo_reporte, recipients)
        if success:
            return jsonify({
                'message': f'Reporte {tipo_reporte} enviado exitosamente',
                'recipients': recipients
            }), 200
        else:
            return jsonify({
                'message': f'Error enviando reporte {tipo_reporte}'
            }), 500
    except Exception as e:
        return jsonify({
            'message': f'Error en el servidor: {str(e)}'
        }), 500

@app.route('/api/reportes/configuracion', methods=['GET'])
def obtener_configuracion_reportes():
    """Obtiene la configuración actual de reportes"""
    return jsonify({
        'email_config': {
            'smtp_server': EMAIL_CONFIG['smtp_server'],
            'email': EMAIL_CONFIG['email'],
            'from_name': EMAIL_CONFIG['from_name']
        },
        'report_config': {
            'recipients': REPORT_CONFIG['recipients'],
            'schedule_daily': REPORT_CONFIG['schedule_daily'],
            'schedule_weekly': REPORT_CONFIG['schedule_weekly'],
            'schedule_monthly': REPORT_CONFIG['schedule_monthly']
        }
    })

@app.route('/api/reportes/configuracion', methods=['PUT'])
def actualizar_configuracion_reportes():
    """Actualiza la configuración de reportes"""
    try:
        data = request.get_json()
        
        # Actualizar configuración de email
        if 'email_config' in data:
            email_config = data['email_config']
            EMAIL_CONFIG.update(email_config)
        
        # Actualizar configuración de reportes
        if 'report_config' in data:
            report_config = data['report_config']
            REPORT_CONFIG.update(report_config)
        
        return jsonify({
            'message': 'Configuración actualizada exitosamente'
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': f'Error actualizando configuración: {str(e)}'
        }), 500

@app.route('/api/reportes/vista-previa', methods=['GET'])
def vista_previa_reporte():
    """Genera una vista previa del reporte sin enviarlo"""
    try:
        tipo_reporte = request.args.get('tipo', 'diario')
        
        # Generar estadísticas
        stats = generar_estadisticas_egresados()
        if not stats:
            return jsonify({'message': 'Error generando estadísticas'}), 500
        
        # Generar HTML
        html_content = generar_html_reporte(stats)
        
        return jsonify({
            'html': html_content,
            'stats': stats,
            'tipo_reporte': tipo_reporte
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': f'Error generando vista previa: {str(e)}'
        }), 500

@app.route('/api/reportes/estadisticas', methods=['GET'])
def obtener_estadisticas_reportes():
    """Obtiene estadísticas para reportes"""
    try:
        stats = generar_estadisticas_egresados()
        if not stats:
            return jsonify({'message': 'Error generando estadísticas'}), 500
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({
            'message': f'Error obteniendo estadísticas: {str(e)}'
        }), 500

# ========================================
# RUTAS PARA SERVIR EL FRONT-END (REACT)
# ========================================

@app.route('/')
def serve():
    """Sirve la aplicación React"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    """Sirve archivos estáticos de React"""
    file_name = path.split('/')[-1]
    if '.' in file_name:
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    """Maneja rutas no encontradas redirigiendo a React"""
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)


