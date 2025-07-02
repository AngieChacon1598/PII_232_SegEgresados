import os

# Usa la variable de entorno si está definida (lo recomendado en Render)
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")

# (Opcional) Si quieres mantener compatibilidad con Oracle local, puedes dejar el bloque de abajo como fallback:
if not SQLALCHEMY_DATABASE_URI:
    DB_USER = os.getenv("DB_USER", "system")
    DB_PASS = os.getenv("DB_PASS", "Admin12345")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "1521")
    DB_SERVICE = os.getenv("DB_SERVICE", "XEPDB1")
    SQLALCHEMY_DATABASE_URI = f"oracle+oracledb://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/?service_name={DB_SERVICE}"
