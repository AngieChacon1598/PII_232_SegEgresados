# 📧 Sistema de Reportes Automatizados

## 🚀 Características

- **Reportes automáticos** por email (diarios, semanales, mensuales)
- **Envío manual** de reportes bajo demanda
- **Vista previa** antes de enviar
- **Configuración flexible** de horarios y destinatarios
- **Reportes HTML** profesionales con estadísticas completas

## 📋 Contenido de los Reportes

Cada reporte incluye:
- 📊 Estadísticas generales de egresados
- 📈 Distribución por carrera
- 💼 Tasa de empleabilidad
- 🏢 Top empresas contratantes
- 🏆 Certificaciones obtenidas
- 📅 Fecha y hora de generación

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
cd Back-End
pip install -r requirements.txt
```

### 2. Configurar Email (Gmail)

#### Paso 1: Activar Verificación en Dos Pasos
1. Ve a tu cuenta de Google
2. Seguridad → Verificación en dos pasos
3. Activa la verificación

#### Paso 2: Generar Contraseña de Aplicación
1. Ve a Seguridad → Contraseñas de aplicación
2. Selecciona "Correo"
3. Copia la contraseña generada (16 caracteres)

#### Paso 3: Editar Configuración
Edita el archivo `email_config.py`:

```python
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'email': 'tu-email@gmail.com',        # Tu email real
    'password': 'abcd efgh ijkl mnop',    # Contraseña de aplicación
    'from_name': 'Sistema de Seguimiento de Egresados'
}
```

### 3. Configurar Destinatarios

En `email_config.py`, edita la lista de destinatarios:

```python
REPORT_CONFIG = {
    'recipients': [
        'admin@vallegrande.edu.pe',
        'angie.chacon.a@vallegrande.edu.pe',
        'otro-email@ejemplo.com'
    ],
    'schedule_daily': '09:00',        # Reporte diario a las 9 AM
    'schedule_weekly': 'monday 10:00', # Reporte semanal los lunes a las 10 AM
    'schedule_monthly': '1 11:00'     # Reporte mensual el día 1 a las 11 AM
}
```

## 🎯 Uso del Sistema

### Envío Manual
1. Ve a "Reportes Automatizados" en el navbar
2. Selecciona el tipo de reporte (diario/semanal/mensual)
3. Opcional: agrega emails adicionales
4. Haz clic en "Vista Previa" para revisar
5. Haz clic en "Enviar Reporte"

### Configuración desde la Interfaz
1. En "Reportes Automatizados", haz clic en "Editar Configuración"
2. Modifica los parámetros necesarios
3. Guarda los cambios

### Reportes Automáticos
- **Diario**: Se envía automáticamente a la hora configurada
- **Semanal**: Se envía el día de la semana configurado
- **Mensual**: Se envía el día del mes configurado

## 🔧 Personalización

### Modificar Horarios
```python
'schedule_daily': '14:30',           # 2:30 PM
'schedule_weekly': 'friday 15:00',   # Viernes 3:00 PM
'schedule_monthly': '15 09:00'       # Día 15 a las 9:00 AM
```

### Agregar Nuevos Tipos de Reporte
1. Edita `app.py`
2. Agrega nueva función en `generar_y_enviar_reporte()`
3. Actualiza la interfaz en `ReportesAutomatizados.js`

## 🛠️ Solución de Problemas

### Error de Autenticación Gmail
- Verifica que la verificación en dos pasos esté activada
- Asegúrate de usar la contraseña de aplicación, no la normal
- Revisa que el email esté correctamente escrito

### Reportes No Se Envían
- Verifica que el backend esté ejecutándose
- Revisa los logs del servidor
- Confirma que los emails estén bien configurados

### Error de Conexión SMTP
- Verifica la configuración del servidor SMTP
- Confirma que el puerto 587 esté abierto
- Revisa la configuración de firewall

## 📊 Ejemplo de Reporte

El reporte incluye:
```
📊 Reporte de Seguimiento de Egresados
Generado automáticamente el 15/12/2024 09:00

📈 Métricas Generales:
- Total Egresados: 150
- Empleados: 120
- Tasa Empleabilidad: 80.0%
- Certificaciones: 45

📋 Estadísticas por Carrera:
- Ingeniería de Sistemas: 85% empleabilidad
- Administración: 75% empleabilidad
- Contabilidad: 90% empleabilidad

🏢 Top Empresas Contratantes:
- TechCorp: 15 egresados
- AdminSolutions: 12 egresados
- DigitalPro: 8 egresados
```

## 🔒 Seguridad

- ✅ Usa contraseñas de aplicación (no contraseñas normales)
- ✅ Verificación en dos pasos obligatoria
- ✅ Emails encriptados con TLS
- ✅ Configuración separada en archivo dedicado

## 📞 Soporte

Para problemas técnicos:
1. Revisa los logs del servidor
2. Verifica la configuración de email
3. Confirma que todas las dependencias estén instaladas
4. Contacta al administrador del sistema 