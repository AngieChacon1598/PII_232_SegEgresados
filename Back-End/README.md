# 🎓 Sistema de Seguimiento de Egresados - Backend

Aplicación Flask que proporciona una API REST para el sistema de seguimiento de egresados, incluyendo el frontend React integrado.

## 🚀 Despliegue en Render

### Configuración Rápida

1. **Ejecuta el script de build** (desde la raíz del proyecto):
   ```bash
   node build-and-deploy.js
   ```

2. **Sube este directorio** (`Back-End/`) a tu repositorio Git

3. **En Render Dashboard**:
   - Crea un nuevo "Web Service"
   - Conecta tu repositorio
   - Configura las variables de entorno

### Variables de Entorno Requeridas

```
SQLALCHEMY_DATABASE_URI=tu_string_de_conexion_a_la_base_de_datos
FLASK_ENV=production
```

### Configuración del Servicio

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app.app:app`
- **Environment**: Python 3

## 📁 Estructura del Proyecto

```
Back-End/
├── app/
│   ├── app.py              # Aplicación principal Flask
│   ├── config.py           # Configuración de la base de datos
│   ├── static/             # Build de React (se genera automáticamente)
│   ├── templates/          # Plantillas HTML
│   └── uploads/            # Archivos subidos
├── Procfile               # Configuración para Render
├── requirements.txt       # Dependencias de Python
└── README.md             # Este archivo
```

## 🔧 Desarrollo Local

### Instalación

1. **Crear entorno virtual**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

2. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno**:
   ```bash
   export SQLALCHEMY_DATABASE_URI="tu_string_de_conexion"
   ```

4. **Ejecutar la aplicación**:
   ```bash
   python app/app.py
   ```

### Build del Frontend

Para desarrollo local, necesitas construir el frontend:

```bash
cd ../front-end
npm install
npm run build
cp -r build/* ../Back-End/app/static/
```

## 📊 API Endpoints

### Egresados
- `GET /egresados` - Listar egresados
- `POST /egresados` - Crear egresado
- `PUT /egresados/{codigo}` - Actualizar egresado
- `DELETE /egresados/{codigo}` - Eliminar egresado

### Detalles de Egresados
- `GET /detalle-egresados` - Listar detalles
- `POST /detalle-egresados` - Crear detalle
- `PUT /detalle-egresados/{id}` - Actualizar detalle
- `DELETE /detalle-egresados/{id}` - Eliminar detalle

### Empresas
- `GET /empresas` - Listar empresas
- `POST /empresas` - Crear empresa
- `PUT /empresas/{id}` - Actualizar empresa
- `DELETE /empresas/{id}` - Eliminar empresa

### Certificaciones
- `GET /certificaciones` - Listar certificaciones
- `POST /certificaciones` - Crear certificación
- `PUT /certificaciones/{id}` - Actualizar certificación
- `DELETE /certificaciones/{id}` - Eliminar certificación

### Reportes
- `GET /api/reportes/egresados-por-carrera` - Reporte por carrera
- `GET /api/reportes/egresados-por-estado` - Reporte por estado
- `GET /api/reportes/egresados-por-anio` - Reporte por año
- `POST /api/reportes/enviar-manual` - Enviar reporte manual

## 🗄️ Base de Datos

La aplicación soporta múltiples bases de datos:

- **Oracle**: `oracle+cx_oracle://usuario:contraseña@host:puerto/nombre`
- **PostgreSQL**: `postgresql://usuario:contraseña@host:puerto/nombre`
- **MySQL**: `mysql://usuario:contraseña@host:puerto/nombre`

## 🔒 Seguridad

- Todas las credenciales deben configurarse como variables de entorno
- La aplicación incluye validación de datos con Marshmallow
- CORS está configurado para permitir peticiones del frontend

## 📈 Monitoreo

- Los logs están disponibles en Render Dashboard
- La aplicación incluye manejo de errores robusto
- Métricas básicas disponibles en Render

## 🐛 Solución de Problemas

### Error de Conexión a Base de Datos
- Verifica que `SQLALCHEMY_DATABASE_URI` esté configurada correctamente
- Asegúrate de que la base de datos sea accesible desde Render

### Error de Módulos
- Verifica que todas las dependencias estén en `requirements.txt`
- Asegúrate de que `gunicorn` esté incluido

### Error de Archivos Estáticos
- Ejecuta `node build-and-deploy.js` para regenerar el build
- Verifica que `app/static/` contenga los archivos de React

## 📞 Soporte

Para problemas específicos de despliegue:
1. Revisa los logs en Render Dashboard
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de Render

---

**Nota**: Este backend incluye automáticamente el frontend React compilado. No necesitas desplegar el frontend por separado.

# Forzar redeploy para que Render detecte runtime.txt 