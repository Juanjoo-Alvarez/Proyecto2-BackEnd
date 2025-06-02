# 🎓 Sistema de Recomendación de Actividades Extracurriculares

API desarrollada con Flask, Neo4j y JWT para gestionar usuarios, actividades y preferencias.

## 🚀 Requisitos Previos

- Python 3.8+
- Neo4j Desktop o Neo4j Aura (versión 4.4+)
- Postman (para pruebas)

## 🔧 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/tu-repo.git
   cd tu-repo

## Instalar dependencias:
pip install -r requirements.txt

## Configurar variables de entorno:
Crear un archivo .env en la raíz del proyecto:
NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=tu-contraseña
JWT_SECRET_KEY=tu-clave-secreta

## Ejecución
python app.py

## 📚 Endpoints
## 🔐 Autenticación

Método	Endpoint	        Body Ejemplo	                                                Descripción
POST	/auth/register	{"name":"Juan", "email":"juan@example.com", "password":"123"}	Registro de usuario
POST	/auth/login	{"email":"juan@example.com", "password":"123"}	                     Inicio de sesión


## 👤 Usuarios
Método	Endpoint	    Headers	                        Descripción
GET	    /users/me	    Authorization: Bearer <token>	Obtener datos del usuario

## 🎯 Actividades
Método	    Endpoint	    Body Ejemplo	                                Descripción
POST	    /activities	    {"nombre":"Fútbol", "categoria":"Deportes"}	    Crear actividad
GET	        /activities		                                                Listar actividades

## ❤️ Preferencias
Método	    Endpoint	    Body Ejemplo	            Descripción
POST	    /preferences	{"actividades":["Fútbol"]}	Añadir preferencias
GET	        /preferences/me		                        Obtener mis preferencias


## 🛠️ Troubleshooting
Error de conexión a Neo4j: Verifica que el servicio de Neo4j esté corriendo y las credenciales en .env.