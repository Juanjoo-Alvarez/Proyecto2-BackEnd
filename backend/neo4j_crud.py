from neo4j import GraphDatabase
from dotenv import load_dotenv
import os
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

class neo4jCRUD:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI")
        self.user = os.getenv("NEO4J_USER")
        self.password = os.getenv("NEO4J_PASSWORD")
        self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))

    def close(self):
        self.driver.close()

    def execute_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record for record in result]
        
     # ---- AUTH ----
    def create_user_with_password(self, name, email, password, rol='usuario'):
        query = """
        MERGE (u:Usuario {email: $email})
        SET u.name = $name,
            u.password = $hashed_pw,
            u.rol = $rol
        RETURN u
        """
        return self.execute_query(query, {
            "name": name,
            "email": email,
            "hashed_pw": generate_password_hash(password),
            "rol": rol
        })

    def verify_user(self, email, password):
        user = self.execute_query(
            "MATCH (u:Usuario {email: $email}) RETURN u",
            {"email": email}
        )
        if user and check_password_hash(user[0]['u']['password'], password):
            return True
        return False

    # ---- ACTIVITIES ----
    def create_activity(self, nombre, place=None, time=None, category=None):
        query = """
        MERGE (a:Actividad {nombre: $nombre})
        SET a.place = $place,
            a.time = $time
        """
        if category:
            query += """
            MERGE (c:Categoria {nombre: $category})
            MERGE (a)-[:PERTENECE_A]->(c)
            SET a.category = $category
            """
        else:
            query += "\nSET a.category = NULL\n"
        query += "RETURN a"
        return self.execute_query(query, {
            "nombre": nombre,
            "place": place,
            "time": time,
            "category": category
        })

    # ---- PREFERENCES ----
    def add_preference_with_list(self, email, actividades):
        actividades_unicas = list(set(actividades))
        query = """
        UNWIND $actividades AS actividad
        MATCH (u:Usuario {email: $email})
        MERGE (a:Actividad {nombre: actividad})
        MERGE (u)-[:LE_GUSTA]->(a)
        RETURN count(a) AS total
        """
        return self.execute_query(query, {
            "email": email,
            "actividades": actividades_unicas
        })