# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu aplicación de Seguimiento de Egresados en Render.

## 📋 Requisitos Previos

- Cuenta en [Render](https://render.com)
- Repositorio Git con tu código
- Base de datos configurada (Oracle, PostgreSQL, MySQL, etc.)

## 🔧 Configuración del Proyecto

### 1. Estructura del Repositorio

Para desplegar en Render, sube **solo** el contenido de la carpeta `Back-End/` a tu repositorio. El front-end se compilará y se incluirá automáticamente.

```
tu-repositorio/
├── app/
│   ├── app.py
│   ├── config.py
│   ├── static/          # Build de React (se genera automáticamente)
│   ├── templates/
│   └── uploads/
├── Procfile
├── requirements.txt
└── README.md
```

### 2. Archivos de Configuración

#### Procfile
```
web: gunicorn app.app:app
```

#### requirements.txt
Ya está configurado correctamente con todas las dependencias necesarias.

## 🛠️ Proceso de Build Automatizado

### Opción 1: Script Automático (Recomendado)

1. Ejecuta el script de build:
```bash
node build-and-deploy.js
```

2. Sube el contenido de `Back-End/` a tu repositorio.

### Opción 2: Manual

1. En la carpeta `front-end/`:
```bash
npm install
npm run build
```

2. Copia el contenido de `front-end/build/` a `Back-End/app/static/`

3. Sube el contenido de `Back-End/` a tu repositorio.

## 🌐 Configuración en Render

### 1. Crear Nuevo Servicio Web

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio Git
4. Configura el servicio:

**Configuración Básica:**
- **Name**: `seguimiento-egresados` (o el nombre que prefieras)
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app.app:app`

### 2. Variables de Entorno

Configura las siguientes variables de entorno en Render:

```
SQLALCHEMY_DATABASE_URI=tu_string_de_conexion_a_la_base_de_datos
FLASK_ENV=production
```

**Ejemplos de strings de conexión:**

**PostgreSQL:**
```
postgresql://usuario:contraseña@host:puerto/nombre_base_datos
```

**MySQL:**
```
mysql://usuario:contraseña@host:puerto/nombre_base_datos
```

**Oracle:**
```
oracle+cx_oracle://usuario:contraseña@host:puerto/nombre_base_datos
```

### 3. Configuración Avanzada

**Auto-Deploy:**
- ✅ Habilitar "Auto-Deploy from Push"

**Health Check Path:**
- `/` (opcional)

**Environment Variables Adicionales:**
```
EMAIL_CONFIG_SMTP_SERVER=smtp.gmail.com
EMAIL_CONFIG_EMAIL=tu_email@gmail.com
EMAIL_CONFIG_PASSWORD=tu_contraseña_de_aplicacion
```

## 🔄 Proceso de Despliegue

### 1. Primer Despliegue

1. Render detectará automáticamente que es una aplicación Python
2. Instalará las dependencias de `requirements.txt`
3. Ejecutará el comando de `Procfile`
4. Tu aplicación estará disponible en la URL proporcionada por Render

### 2. Actualizaciones Futuras

1. Ejecuta el script de build: `node build-and-deploy.js`
2. Haz commit y push de los cambios
3. Render detectará los cambios y hará el despliegue automáticamente

## 🐛 Solución de Problemas

### Error: "No module named 'gunicorn'"
- Verifica que `gunicorn` esté en `requirements.txt`

### Error: "Module not found"
- Asegúrate de que todas las dependencias estén en `requirements.txt`

### Error: "Database connection failed"
- Verifica que la variable `SQLALCHEMY_DATABASE_URI` esté configurada correctamente
- Asegúrate de que la base de datos sea accesible desde Render

### Error: "Static files not found"
- Verifica que la carpeta `app/static/` contenga el build de React
- Ejecuta el script de build nuevamente

## 📊 Monitoreo

### Logs
- Ve a tu servicio en Render Dashboard
- Haz clic en "Logs" para ver los logs en tiempo real

### Métricas
- Render proporciona métricas básicas de CPU y memoria
- Considera usar servicios externos para monitoreo avanzado

## 🔒 Seguridad

### Variables Sensibles
- Nunca subas credenciales directamente al código
- Usa variables de entorno para toda la información sensible
- Considera usar un gestor de secretos para producción

### HTTPS
- Render proporciona HTTPS automáticamente
- No necesitas configuración adicional

## 📈 Escalabilidad

### Planes de Render
- **Free**: Para desarrollo y pruebas
- **Starter**: $7/mes - Para aplicaciones pequeñas
- **Standard**: $25/mes - Para aplicaciones medianas
- **Pro**: $50/mes - Para aplicaciones grandes

### Optimizaciones
- Usa CDN para archivos estáticos
- Implementa caché en la base de datos
- Considera usar Redis para sesiones

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Render Dashboard
2. Verifica la configuración de variables de entorno
3. Asegúrate de que el build se haya generado correctamente
4. Consulta la [documentación de Render](https://render.com/docs)

---

## ✅ Checklist de Despliegue

- [ ] Ejecutar `node build-and-deploy.js`
- [ ] Verificar que `Back-End/app/static/` contenga el build de React
- [ ] Subir contenido de `Back-End/` al repositorio
- [ ] Crear servicio web en Render
- [ ] Configurar variables de entorno
- [ ] Verificar que el despliegue sea exitoso
- [ ] Probar la aplicación en la URL de Render

¡Tu aplicación estará lista para usar! 🎉 