from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3 
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)

# Configuración de CORS (¡Esta está perfecta!)
CORS(app, 
     resources={r"/api/*": {"origins": "http://localhost:8100"}}, 
     allow_headers=["Content-Type", "Authorization"], 
     supports_credentials=True
)

bcrypt = Bcrypt(app)

app.config["JWT_SECRET_KEY"] = "mi-clave-secreta-muy-segura-123"
app.config["JWT_CSRF_PROTECTION"] = False
jwt = JWTManager(app)



def connect_db():
    conn = sqlite3.connect('preguntas.db')
    conn.row_factory = sqlite3.Row 
    return conn

# --- (Ruta de Registro) ---
@app.route("/api/register", methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Faltan usuario y contraseña"}), 400
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)", 
            (username, password_hash)
        )
        conn.commit()
        conn.close()
        return jsonify({"mensaje": f"Usuario '{username}' creado exitosamente"}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Ese nombre de usuario ya existe"}), 409
    except Exception as e:
        conn.close()
        print(f"Error en registro: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# --- (Ruta de Login) ---
@app.route("/api/login", methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Faltan usuario y contraseña"}), 400
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()
        if user and bcrypt.check_password_hash(user['password_hash'], password):
            access_token = create_access_token(identity=user['id'])
            return jsonify({
                "mensaje": f"Login exitoso, ¡bienvenido {user['username']}!",
                "access_token": access_token
            }), 200
        else:
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401
    except Exception as e:
        print(f"Error en login: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# --- (Ruta de Preguntas) ---
@app.route("/api/preguntas/<string:tema>", methods=['GET'])
def get_preguntas_por_tema(tema):
    preguntas_lista = []
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM preguntas WHERE tema = ?", (tema,))
        rows = cursor.fetchall()
        conn.close()
        if not rows:
            return jsonify({"error": f"No se encontraron preguntas para el tema '{tema}'"}), 404
        for row in rows:
            preguntas_lista.append({
                "id": row["id"], "tema": row["tema"], "pregunta": row["pregunta"],
                "opciones": row["opciones"].split('|'), 
                "respuesta_correcta": row["respuesta_correcta"], "explicacion": row["explicacion"] 
            })
        return jsonify({"tema": tema, "preguntas": preguntas_lista})
    except Exception as e:
        print(f"Error al leer la base de datos: {e}")
        return jsonify({"error": "No se pudieron cargar las preguntas"}), 500

# --- (Ruta de Perfil) ---
@app.route("/api/user/profile", methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id = get_jwt_identity() 
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT username, total_xp FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        return jsonify({
            "username": user["username"],
            "total_xp": user["total_xp"]
        }), 200
    except Exception as e:
        print(f"Error en perfil: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# --- (Ruta de Guardar XP) ---
@app.route("/api/user/update_xp", methods=['POST'])
@jwt_required()
def update_user_xp():
    user_id = get_jwt_identity()
    data = request.get_json()
    xp_ganado = data.get('xp_ganado')
    if xp_ganado is None:
        return jsonify({"error": "Falta 'xp_ganado'"}), 400
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET total_xp = total_xp + ? WHERE id = ?", 
            (xp_ganado, user_id)
        )
        conn.commit()
        conn.close()
        return jsonify({"mensaje": "XP actualizado correctamente"}), 200
    except Exception as e:
        print(f"Error actualizando XP: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)