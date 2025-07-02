# Configuración de Email para Reportes Automatizados
# IMPORTANTE: Cambia estos valores con tu información real

# Configuración del servidor SMTP
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',  # Servidor SMTP de Gmail
    'smtp_port': 587,                 # Puerto para TLS
    'email': 'angie.chacon.aparcana@gmail.com',    # Tu email de Gmail
    'password': 'emoh mfiy cloh msap',    # Contraseña de aplicación de Gmail
    'from_name': 'Sistema de Seguimiento de Egresados'
}

# Configuración de Reportes Automatizados
REPORT_CONFIG = {
    'recipients': [
        'admin@vallegrande.edu.pe',
        'angie.chacon.a@vallegrande.edu.pe'
        # Agrega más emails aquí
    ],
    'schedule_daily': '09:00',        # Hora del reporte diario (HH:MM)
    'schedule_weekly': 'monday 10:00', # Día y hora del reporte semanal
    'schedule_monthly': '1 11:00'     # Día y hora del reporte mensual
}

# INSTRUCCIONES PARA CONFIGURAR GMAIL:
# 1. Ve a tu cuenta de Google
# 2. Activa la verificación en dos pasos
# 3. Ve a "Contraseñas de aplicación"
# 4. Genera una nueva contraseña para "Correo"
# 5. Usa esa contraseña en el campo 'password' arriba
# 6. NO uses tu contraseña normal de Gmail

# EJEMPLO DE CONFIGURACIÓN:
# EMAIL_CONFIG = {
#     'smtp_server': 'smtp.gmail.com',
#     'smtp_port': 587,
#     'email': 'mi-email@gmail.com',
#     'password': 'abcd efgh ijkl mnop',  # Contraseña de aplicación
#     'from_name': 'Sistema de Seguimiento de Egresados'
# } 