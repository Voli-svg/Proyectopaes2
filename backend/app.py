import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

app = Flask(__name__)

# Configuración CORS
CORS(app,
     resources={r"/api/*": {"origins": ["http://localhost:8100", "https://proyectopaes.netlify.app"]}},
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True
)

bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "tu-clave-secreta-local-cambiala")
app.config["JWT_CSRF_PROTECTION"] = False
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
jwt = JWTManager(app)

# --- (Callbacks de error JWT) ---
@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    print(f"Internal JWT Error: {error_string}")
    return jsonify({"msg": f"Invalid Token: {error_string}"}), 422
@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    print(f"JWT Unauthorized Error: {error_string}")
    return jsonify({"msg": f"Unauthorized: {error_string}"}), 401

def connect_db():
    conn = sqlite3.connect('preguntas.db')
    conn.row_factory = sqlite3.Row
    return conn

# --- DICCIONARIO MATERIA_EJES ---
MATERIA_EJES = {
    "Matematicas_M1": ["Números", "Álgebra y Funciones", "Geometría", "Probabilidad y Estadística"],
    "Lenguaje": ["Vocabulario Contextual", "Habilidad: Rastrear-Localizar", "Habilidad: Relacionar-Interpretar","Habilidad: Evaluar-Reflexionar"],
    "Ciencias_Comun": ["Biología (MC)", "Física (MC)", "Química (MC)"],
    "Matematicas_M2": ["Números Complejos M2", "Algebra y Funciones M2", "Geometría M2", "Probabilidad y Estadística M2"],
    "Historia": ["Historia en Perspectiva", "Democracia y Ciudadanía", "Economía y Sociedad"]
}

# --- RUTA get_temas_por_materia ---
@app.route("/api/temas/<string:materia_principal>", methods=['GET'])
def get_temas_por_materia(materia_principal):
    ejes_tematicos = MATERIA_EJES.get(materia_principal)
    if not ejes_tematicos:
        return jsonify({"error": f"Materia principal '{materia_principal}' no encontrada"}), 404
    return jsonify({
        "materia": materia_principal,
        "temas": ejes_tematicos
    }), 200

# --- (Ruta de Registro) ---
@app.route("/api/register", methods=['POST'])
def register_user():
    data = request.get_json(); username = data.get('username'); password = data.get('password')
    if not username or not password: return jsonify({"error": "Faltan datos"}), 400
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    conn = None # Definir fuera del try
    try:
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, password_hash))
        conn.commit(); conn.close()
        return jsonify({"mensaje": f"Usuario '{username}' creado"}), 201
    except sqlite3.IntegrityError:
        if conn: conn.close()
        return jsonify({"error": "Usuario ya existe"}), 409
    except Exception as e:
        if conn: conn.close()
        print(f"Error registro: {e}")
        return jsonify({"error": "Error interno"}), 500

# --- (Ruta de Login) ---
@app.route("/api/login", methods=['POST'])
def login_user():
    data = request.get_json(); username = data.get('username'); password = data.get('password')
    if not username or not password: return jsonify({"error": "Faltan datos"}), 400
    conn = None
    try:
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone(); conn.close() # Cerramos aquí si todo va bien
        if user and bcrypt.check_password_hash(user['password_hash'], password):
            user_id_string = str(user['id']); access_token = create_access_token(identity=user_id_string)
            return jsonify({"mensaje": f"Login exitoso", "access_token": access_token}), 200
        else:
             # No cerramos conn aquí porque ya se cerró arriba si se encontró usuario
            return jsonify({"error": "Credenciales incorrectas"}), 401
    except Exception as e:
        if conn: conn.close() # Cerramos si hubo error antes de cerrar
        print(f"Error login: {e}")
        return jsonify({"error": "Error interno"}), 500

# --- (Ruta de Preguntas) ---
@app.route("/api/preguntas/<string:tema>", methods=['GET'])
def get_preguntas_por_tema(tema):
    preguntas_lista = []
    conn = None
    try:
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("SELECT * FROM preguntas WHERE tema LIKE ? OR tema = ?", (f"{tema}%", tema))
        rows = cursor.fetchall(); conn.close()
        if not rows:
             return jsonify({"error": f"No hay preguntas para el tema o eje '{tema}'"}), 404
        for row in rows:
            preguntas_lista.append({
                "id": row["id"], "tema": row["tema"], "pregunta": row["pregunta"],
                "opciones": row["opciones"].split('|'),
                "respuesta_correcta": row["respuesta_correcta"], "explicacion": row["explicacion"]
            })
        return jsonify({"tema": tema, "preguntas": preguntas_lista})
    except Exception as e:
        print(f"Error al buscar preguntas para '{tema}': {e}")
        if conn: conn.close()
        return jsonify({"error": "Error al cargar preguntas"}), 500

# --- (Ruta de Perfil - ¡CORREGIDO EL EXCEPT!) ---
@app.route("/api/user/profile", methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id_string = get_jwt_identity()
    conn = None
    try:
        user_id = int(user_id_string)
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("SELECT username, total_xp FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone(); conn.close()
        if not user: return jsonify({"error": "Usuario no encontrado"}), 404
        return jsonify({"username": user["username"], "total_xp": user["total_xp"]}), 200
    except Exception as e:
        print(f"Error perfil: {e}") # Instrucción 1
        if conn:                  # Instrucción 2 (condicional)
            conn.close()          # Instrucción 3 (dentro del if)
        return jsonify({"error": "Error interno"}), 500 # Instrucción 4

# --- (Ruta de Guardar XP - ¡CORREGIDO EL EXCEPT!) ---
@app.route("/api/user/update_xp", methods=['POST'])
@jwt_required()
def update_user_xp():
    user_id_string = get_jwt_identity()
    conn = None
    try:
        user_id = int(user_id_string)
        data = request.get_json(); xp_ganado = data.get('xp_ganado')
        if xp_ganado is None or not isinstance(xp_ganado, int): return jsonify({"error": "'xp_ganado' debe ser entero"}), 400
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("UPDATE users SET total_xp = total_xp + ? WHERE id = ?", (xp_ganado, user_id))
        conn.commit(); conn.close()
        return jsonify({"mensaje": "XP actualizado"}), 200
    except Exception as e:
        print(f"Error update XP: {e}") # Instrucción 1
        if conn:                  # Instrucción 2 (condicional)
            conn.close()          # Instrucción 3 (dentro del if)
        return jsonify({"error": "Error interno"}), 500 # Instrucción 4

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)