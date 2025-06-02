from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
from neo4j_crud import neo4jCRUD
from dotenv import load_dotenv
import os
from functools import wraps
import re

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY") or "super-secret-dev-key"
app.config["JWT_HEADER_TYPE"] = ""
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
jwt = JWTManager(app)
db = neo4jCRUD()

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        rol = claims.get('rol', 'usuario')
        if rol != 'admin':
            return jsonify({"error": "Solo los administradores pueden realizar esta acción"}), 403
        return fn(*args, **kwargs)
    return wrapper

# ---- AUTENTICACIÓN ----
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not all(k in data for k in ['name', 'email', 'password']):
            return jsonify({"error": "Faltan campos: name, email, password"}), 400

        # Rol por defecto: 'usuario', pero permite registrar admins si se envía explícitamente
        rol = data.get('rol', 'usuario')
        if rol not in ['usuario', 'admin']:
            return jsonify({"error": "Rol inválido"}), 400

        # Verificar si el usuario ya existe
        if db.execute_query("MATCH (u:Usuario {email: $email}) RETURN u", {"email": data['email']}):
            return jsonify({"error": "El usuario ya existe"}), 409

        # Crear usuario con contraseña hasheada y rol
        db.create_user_with_password(data['name'], data['email'], data['password'], rol)
        return jsonify({"status": "success", "message": "Usuario registrado"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not all(k in data for k in ['email', 'password']):
            return jsonify({"error": "Faltan campos: email, password"}), 400

        # Verificar credenciales
        if not db.verify_user(data['email'], data['password']):
            return jsonify({"error": "Credenciales inválidas"}), 401

        # Obtener el rol del usuario
        user_info = db.execute_query(
            "MATCH (u:Usuario {email: $email}) RETURN u.name AS name, u.rol AS rol", 
            {"email": data['email']}
        )
        if not user_info:
            return jsonify({"error": "Usuario no encontrado"}), 404
        rol = user_info[0].get('rol', 'usuario')
        name = user_info[0].get('name')

        # Generar token JWT con identidad (email) y rol como claim
        access_token = create_access_token(identity=data['email'], additional_claims={"rol": rol})
        return jsonify({
            "status": "success",
            "access_token": access_token,
            "user": {
                "email": data['email'],
                "name": name,
                "rol": rol
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---- USUARIOS ----
@app.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        email = get_jwt_identity()
        
        # Query modificada para devolver propiedades específicas
        user_data = db.execute_query(
            """
            MATCH (u:Usuario {email: $email})
            RETURN {
                name: u.name,
                email: u.email,
                preferences: [(u)-[:LE_GUSTA]->(a) | a.nombre]
            } AS user
            """,
            {"email": email}
        )
        
        if not user_data:
            return jsonify({"error": "Usuario no encontrado"}), 404
            
        print(user_data[0]['user'])  # Para depuración, puedes eliminarlo en producción
        return jsonify({
            "status": "success",
            "data": user_data[0]['user']  # Extraemos el diccionario serializable
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/me', methods=['DELETE'])
@jwt_required()
def delete_current_user():
    try:
        email = get_jwt_identity()
        # Eliminar usuario y todas sus relaciones
        db.execute_query(
            """
            MATCH (u:Usuario {email: $email})
            DETACH DELETE u
            """,
            {"email": email}
        )
        return jsonify({
            "status": "success",
            "message": "Usuario eliminado correctamente"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---- ACTIVIDADES ----
@app.route('/api/activities', methods=['POST'])
@admin_required
def create_activity():
    try:
        data = request.get_json()
        if not data.get('nombre'):
            return jsonify({"error": "Campo 'nombre' es requerido"}), 400
        place = data.get('place')
        time = data.get('time')
        category = data.get('category') or data.get('categoria')
        # Validar formato de time: dd/mm/yy h:mm(am|pm)
        if time:
            pattern = r"^\d{2}/\d{2}/\d{2} \d{1,2}:\d{2}(am|pm)$"
            if not re.match(pattern, time.lower()):
                return jsonify({"error": "El campo 'time' debe tener formato dd/mm/yy h:mmam o h:mmpm, ejemplo: 02/06/25 2:00pm"}), 400
        result = db.create_activity(
            data['nombre'],
            place,
            time,
            category
        )

        node = result[0]['a']
        activity = dict(node.items())


        return jsonify({
            "status": "success",
            "data": activity
        }, 201)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activities', methods=['GET'])
def get_activities():
    try:
        activities = db.execute_query(
            """
            MATCH (a:Actividad)
            OPTIONAL MATCH (a)-[:PERTENECE_A]->(c:Categoria)
            RETURN a, c.nombre AS categoria
            """
        )

        grouped = {}
        for record in activities:
            a = record['a']
            categoria = a.get('category') or record['categoria'] or 'Sin categoría'
            actividad = {
                "nombre": a.get('nombre'),
                "place": a.get('place'),
                "time": a.get('time'),
                "category": a.get('category') or record['categoria']
            }
            if categoria not in grouped:
                grouped[categoria] = []
            grouped[categoria].append(actividad)

        data = [
            {"categoria": cat, "actividades": acts}
            for cat, acts in grouped.items()
        ]
        return jsonify({
            "status": "success",
            "count": len(data),
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- ELIMINAR ACTIVIDAD (solo admin) ----
@app.route('/api/activities/<nombre>', methods=['DELETE'])
@admin_required
def delete_activity(nombre):
    # Aquí podrías agregar lógica de admin si implementas roles
    try:
        db.execute_query(
            """
            MATCH (a:Actividad {nombre: $nombre})
            DETACH DELETE a
            """,
            {"nombre": nombre}
        )
        return jsonify({
            "status": "success",
            "message": f"Actividad '{nombre}' eliminada"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---- PREFERENCIAS ----
@app.route('/api/preferences/me', methods=['GET'])
@jwt_required()
def get_my_preferences():
    try:
        email = get_jwt_identity()
        preferences = db.execute_query(
            """
            MATCH (u:Usuario {email: $email})-[:LE_GUSTA]->(a:Actividad)
            OPTIONAL MATCH (a)-[:PERTENECE_A]->(c:Categoria)
            RETURN a.nombre AS actividad, c.nombre AS categoria
            """,
            {"email": email}
        )
        # Agrupar actividades por categoría
        grouped = {}
        for pref in preferences:
            categoria = pref['categoria'] or 'Sin categoría'
            actividad = pref['actividad']
            if categoria not in grouped:
                grouped[categoria] = []
            grouped[categoria].append(actividad)
        data = [
            {"categoria": cat, "actividades": acts}
            for cat, acts in grouped.items()
        ]
        return jsonify({
            "status": "success",
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/preferences', methods=['POST'])
@jwt_required()
def add_preferences():
    try:
        data = request.get_json()
        email = get_jwt_identity()

        actividades_input = data.get('actividades')
        if not actividades_input or not isinstance(actividades_input, list):
            return jsonify({"error": "El campo 'actividades' debe ser una lista válida"}), 400

        # Obtener todas las actividades registradas
        actividadesExistentes = db.execute_query(
            """
            MATCH (a:Actividad)
            RETURN a.nombre AS nombre
            """
        )
        nombres_validos = {record['nombre'] for record in actividadesExistentes}

        # Validar que todas las actividades ingresadas existan
        actividades_invalidas = [act for act in actividades_input if act not in nombres_validos]
        if actividades_invalidas:
            return jsonify({
                "error": "Las siguientes actividades no existen en la base de datos",
                "actividades_invalidas": actividades_invalidas
            }), 400

        # Crear relaciones LE_GUSTA
        for actividad in actividades_input:
            db.execute_query(
                """
                MATCH (u:Usuario {email: $email})
                MATCH (a:Actividad {nombre: $actividad})
                MERGE (u)-[:LE_GUSTA]->(a)
                """,
                {"email": email, "actividad": actividad}
            )

        return jsonify({
            "status": "success",
            "message": "Preferencias actualizadas correctamente"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- ELIMINAR PREFERENCIA DE ACTIVIDAD DEL USUARIO ----
@app.route('/api/preferences/<actividad>', methods=['DELETE'])
@jwt_required()
def delete_preference(actividad):
    try:
        email = get_jwt_identity()
        db.execute_query(
            """
            MATCH (u:Usuario {email: $email})-[r:LE_GUSTA]->(a:Actividad {nombre: $actividad})
            DELETE r
            """,
            {"email": email, "actividad": actividad}
        )
        return jsonify({
            "status": "success",
            "message": f"Preferencia '{actividad}' eliminada"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---- RECOMENDACIONES ----
@app.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    try:
        email = get_jwt_identity()
        # Buscar actividades que le gustan a usuarios similares pero que el usuario actual no ha marcado
        recommendations = db.execute_query(
            """
            MATCH (me:Usuario {email: $email})-[:LE_GUSTA]->(a1:Actividad)
            WITH me, collect(a1) AS mis_actividades
            MATCH (me)-[:LE_GUSTA]->(a:Actividad)<-[:LE_GUSTA]-(other:Usuario)-[:LE_GUSTA]->(rec:Actividad)
            WHERE NOT rec IN mis_actividades AND other.email <> $email
            OPTIONAL MATCH (rec)-[:PERTENECE_A]->(c:Categoria)
            RETURN DISTINCT rec.nombre AS actividad, c.nombre AS categoria
            LIMIT 10
            """,
            {"email": email}
        )
        # Agrupar recomendaciones por categoría
        grouped = {}
        for rec in recommendations:
            categoria = rec['categoria'] or 'Sin categoría'
            actividad = rec['actividad']
            if categoria not in grouped:
                grouped[categoria] = []
            grouped[categoria].append(actividad)
        data = [
            {"categoria": cat, "actividades": acts}
            for cat, acts in grouped.items()
        ]
        return jsonify({
            "status": "success",
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activities/<nombre>/like', methods=['POST'])
@jwt_required()
def like_activity(nombre):
    try:
        email = get_jwt_identity()
        # Crear relación LE_GUSTA si no existe
        db.execute_query(
            '''
            MATCH (u:Usuario {email: $email})
            MATCH (a:Actividad {nombre: $nombre})
            MERGE (u)-[:LE_GUSTA]->(a)
            ''',
            {"email": email, "nombre": nombre}
        )
        return jsonify({
            "status": "success",
            "message": f"Actividad '{nombre}' marcada como preferida"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activities/<nombre>/like', methods=['DELETE'])
@jwt_required()
def unlike_activity(nombre):
    try:
        email = get_jwt_identity()
        # Eliminar relación LE_GUSTA si existe
        db.execute_query(
            '''
            MATCH (u:Usuario {email: $email})-[r:LE_GUSTA]->(a:Actividad {nombre: $nombre})
            DELETE r
            ''',
            {"email": email, "nombre": nombre}
        )
        return jsonify({
            "status": "success",
            "message": f"Preferencia sobre '{nombre}' eliminada"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)