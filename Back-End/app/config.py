import os
from dotenv import load_dotenv
# Cargar variables de entorno virtual desde un archivo .env
load_dotenv()
DB_USER = os.getenv("DB_USER", "system")
DB_PASS = os.getenv("DB_PASS", "Admin12345")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "1521")
DB_SERVICE = os.getenv("DB_SERVICE", "XEPDB1")
SQLALCHEMY_DATABASE_URI = f"oracle+oracledb://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/?service_name={DB_SERVICE}"


# Conectar a Oracle XE en localhost
conn = oracledb.connect(
    user="system",
    password="Admin12345",
    dsn="localhost:1521/XEPDB1"  # Reemplaza "XEPDB1" con "XE" si es necesario
)


# Crear cursor y ejecutar una consulta de prueba
cursor = conn.cursor()
cursor.execute("SELECT * FROM SYSTEM.EGRESADO")


# Obtener y mostrar los registros
rows = cursor.fetchall()


if rows:
    for row in rows:
        print(row)  # Imprime cada fila de la tabla
else:
    print("No hay registros en la tabla PRODUCT.")


# Cerrar cursor y conexión
cursor.close()
conn.close()
