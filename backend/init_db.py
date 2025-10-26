import sqlite3

conn = sqlite3.connect('preguntas.db')
cursor = conn.cursor()

# --- Borra las tablas si existen ---
cursor.execute("DROP TABLE IF EXISTS preguntas")
cursor.execute("DROP TABLE IF EXISTS users")
print("Tablas antiguas borradas (si existían).")

# --- Crea la tabla 'preguntas' ---
cursor.execute("""
CREATE TABLE preguntas (
    id TEXT PRIMARY KEY,
    tema TEXT NOT NULL,
    pregunta TEXT NOT NULL,
    opciones TEXT NOT NULL,
    respuesta_correcta TEXT NOT NULL,
    explicacion TEXT NOT NULL
)
""")
print("Tabla 'preguntas' creada.")

# --- Crea la tabla 'users' ---
cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    total_xp INTEGER DEFAULT 0
)
""")
print("Tabla 'users' creada.")

# --- ¡NUEVO! Lee y ejecuta el archivo SQL ---
try:
    # Asegúrate de que el archivo 'preguntas.sql' esté en la misma carpeta 'backend'
    with open('preguntas.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()

    # Ejecuta TODO el contenido del archivo SQL
    cursor.executescript(sql_script)
    print("¡Preguntas insertadas correctamente desde preguntas.sql!")

except FileNotFoundError:
    print("ERROR: No se encontró el archivo 'preguntas.sql'. Asegúrate de que esté en la carpeta 'backend'.")
except Exception as e:
    print(f"ERROR al ejecutar preguntas.sql: {e}")

# --- Guarda los cambios y cierra ---
conn.commit()
conn.close()

print("¡Base de datos 'preguntas.db' lista!")