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
     resources={r"/api/*": {"origins": "http://localhost:8100"}},
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True
)

bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = "mi-clave-secreta-muy-segura-123"
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

# --- DICCIONARIO MATERIA_EJES (¡EL TUYO!) ---
# Las claves son para la URL, los valores son los nombres que quieres mostrar en el menú.
MATERIA_EJES = {
    "Matematicas_M1": ["Números", "Álgebra y Funciones", "Geometría", "Probabilidad y Estadística"],
    "Lenguaje": ["Vocabulario Contextual", "Habilidad: Rastrear-Localizar", "Habilidad: Relacionar-Interpretar","Habilidad: Evaluar-Reflexionar"],
    "Ciencias_Comun": ["Módulo Común","Mención Biología", "Mención Química", "Mención Física"],
    "Matematicas_M2": ["Números Complejos M2", "Algebra y Funciones M2", "Geometría M2", "Probabilidad y Estadística M2"],
    "Historia": ["Historia en Perspectiva", "Democracia y Ciudadanía", "Economía y Sociedad"]
}

# --- ¡RUTA get_temas_por_materia SIMPLIFICADA! ---
@app.route("/api/temas/<string:materia_principal>", methods=['GET'])
def get_temas_por_materia(materia_principal):
    """
    Devuelve la LISTA DE EJES principales para una materia,
    directamente desde el diccionario MATERIA_EJES.
    """
    # 1. Busca la lista de ejes asociada a la materia principal
    ejes_tematicos = MATERIA_EJES.get(materia_principal)

    # 2. Si no encuentra la materia, devuelve error 404
    if not ejes_tematicos:
        return jsonify({"error": f"Materia principal '{materia_principal}' no encontrada"}), 404

    # 3. Si la encuentra, devuelve la lista de ejes directamente
    return jsonify({
        "materia": materia_principal,
        "temas": ejes_tematicos # Devuelve la lista tal cual del diccionario
    }), 200


# --- (Tus rutas existentes: /register, /login, /preguntas/, /profile, /update_xp siguen igual) ---
# ... (asegúrate que estén aquí) ...
@app.route("/api/register", methods=['POST'])
def register_user():
    data = request.get_json(); username = data.get('username'); password = data.get('password')
    if not username or not password: return jsonify({"error": "Faltan datos"}), 400
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    try:
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, password_hash))
        conn.commit(); conn.close()
        return jsonify({"mensaje": f"Usuario '{username}' creado"}), 201
    except sqlite3.IntegrityError: conn.close(); return jsonify({"error": "Usuario ya existe"}), 409
    except Exception as e: conn.close(); print(f"Error registro: {e}"); return jsonify({"error": "Error interno"}), 500

@app.route("/api/login", methods=['POST'])
def login_user():
    data = request.get_json(); username = data.get('username'); password = data.get('password')
    if not username or not password: return jsonify({"error": "Faltan datos"}), 400
    try:
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone(); conn.close()
        if user and bcrypt.check_password_hash(user['password_hash'], password):
            user_id_string = str(user['id']); access_token = create_access_token(identity=user_id_string)
            return jsonify({"mensaje": f"Login exitoso", "access_token": access_token}), 200
        else: return jsonify({"error": "Credenciales incorrectas"}), 401
    except Exception as e: print(f"Error login: {e}"); return jsonify({"error": "Error interno"}), 500

@app.route("/api/preguntas/<string:tema>", methods=['GET'])
def get_preguntas_por_tema(tema):
    preguntas_lista = []
    try:
        conn = connect_db(); cursor = conn.cursor()
        # Busca preguntas que COMIENCEN con el eje temático seleccionado
        # Ej: Si el tema es "Números", busca "Números - %"
        cursor.execute("SELECT * FROM preguntas WHERE tema LIKE ?", (f"{tema}%",))
        rows = cursor.fetchall(); conn.close()
        if not rows:
             # Si no encuentra temas específicos (ej. "Números - Porcentajes"),
             # busca preguntas cuyo tema sea EXACTAMENTE el eje (ej. "Números")
             print(f"No se encontraron temas específicos iniciando con '{tema}'. Buscando tema exacto...")
             conn = connect_db(); cursor = conn.cursor()
             cursor.execute("SELECT * FROM preguntas WHERE tema = ?", (tema,))
             rows = cursor.fetchall(); conn.close()
             if not rows:
                 return jsonify({"error": f"No hay preguntas para el tema o eje '{tema}'"}), 404

        for row in rows:
            preguntas_lista.append({
                "id": row["id"], "tema": row["tema"], "pregunta": row["pregunta"],
                "opciones": row["opciones"].split('|'),
                "respuesta_correcta": row["respuesta_correcta"], "explicacion": row["explicacion"]
            })
        # Devuelve las preguntas encontradas (podrían ser de varios subtemas si se usó LIKE)
        return jsonify({"tema": tema, "preguntas": preguntas_lista})
    except Exception as e:
        print(f"Error al buscar preguntas para '{tema}': {e}")
        if conn: conn.close()
        return jsonify({"error": "Error al cargar preguntas"}), 500


@app.route("/api/user/profile", methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id_string = get_jwt_identity()
    try:
        user_id = int(user_id_string)
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("SELECT username, total_xp FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone(); conn.close()
        if not user: return jsonify({"error": "Usuario no encontrado"}), 404
        return jsonify({"username": user["username"], "total_xp": user["total_xp"]}), 200
    except Exception as e: print(f"Error perfil: {e}"); return jsonify({"error": "Error interno"}), 500

@app.route("/api/user/update_xp", methods=['POST'])
@jwt_required()
def update_user_xp():
    user_id_string = get_jwt_identity()
    try:
        user_id = int(user_id_string)
        data = request.get_json(); xp_ganado = data.get('xp_ganado')
        if xp_ganado is None: return jsonify({"error": "Falta 'xp_ganado'"}), 400
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("UPDATE users SET total_xp = total_xp + ? WHERE id = ?", (xp_ganado, user_id))
        conn.commit(); conn.close()
        return jsonify({"mensaje": "XP actualizado"}), 200
    except Exception as e: print(f"Error update XP: {e}"); return jsonify({"error": "Error interno"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)