import sqlite3

conn = sqlite3.connect('preguntas.db')
cursor = conn.cursor()

# --- Dejamos toda la lógica de 'preguntas' como estaba ---
cursor.execute("DROP TABLE IF EXISTS preguntas")
cursor.execute("""
CREATE TABLE preguntas (
    id TEXT PRIMARY KEY,
    tema TEXT NOTT NULL,
    pregunta TEXT NOT NULL,
    opciones TEXT NOT NULL, 
    respuesta_correcta TEXT NOT NULL,
    explicacion TEXT NOT NULL 
)
""")
preguntas_para_insertar = [
    # ... (todas tus tuplas de preguntas van aquí, no las borres) ...
    (
      "alg-001", "Álgebra",
      "¿Cuál es el resultado de resolver la ecuación '2x + 3 = 9'?",
      "x = 2|x = 3|x = 6|x = 9",
      "x = 3",
      "Para resolver '2x + 3 = 9', primero restas 3 a ambos lados (2x = 6). Luego, divides ambos lados por 2 (x = 3)."
    ),
    (
      "alg-002", "Álgebra",
      "¿Cuál es el valor de 'x' en '5x - 10 = 5'?",
      "x = 1|x = 2|x = 3|x = 5",
      "x = 3",
      "Para resolver '5x - 10 = 5', primero sumas 10 a ambos lados (5x = 15). Luego, divides ambos lados por 5 (x = 3)."
    ),
    (
      "alg-003", "Álgebra",
      "Si x = 2, ¿cuánto es x + x²?",
      "4|6|8|10",
      "6",
      "Reemplazamos 'x' por 2: (2) + (2)². Primero calculamos la potencia 2² = 4. Luego sumamos: 2 + 4 = 6."
    ),
    (
      "hist-001", "Historia",
      "¿En qué año llegó Cristóbal Colón a América?",
      "1492|1500|1450|1600",
      "1492",
      "La primera expedición de Colón, financiada por los Reyes Católicos de España, llegó al continente americano en octubre de 1492."
    ),
    (
      "hist-002", "Historia",
      "¿Qué civilización construyó Machu Picchu?",
      "Aztecas|Mayas|Incas|Mapuches",
      "Incas",
      "Machu Picchu fue construido por los Incas alrededor del siglo XV, durante el gobierno del inca Pachacútec."
    )
]
cursor.executemany("""
INSERT INTO preguntas (id, tema, pregunta, opciones, respuesta_correcta, explicacion) 
VALUES (?, ?, ?, ?, ?, ?)
""", preguntas_para_insertar)

print("¡Tabla 'preguntas' creada e inicializada!")

# --- ¡NUEVO! Creamos la tabla 'users' ---
cursor.execute("DROP TABLE IF EXISTS users")
cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    total_xp INTEGER DEFAULT 0
)
""")

print("¡Tabla 'users' creada!")

conn.commit()
conn.close()

print("¡Base de datos 'preguntas.db' actualizada con ambas tablas!")