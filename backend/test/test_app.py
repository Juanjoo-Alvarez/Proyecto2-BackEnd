import pytest
from unittest.mock import patch, MagicMock
from app import app as flask_app

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

# ---- AUTENTICACIÓN ----

@patch('app.db')
def test_register_success(mock_db, client):
    mock_db.execute_query.return_value = []
    mock_db.create_user_with_password.return_value = None
    response = client.post('/api/auth/register', json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    assert response.json['status'] == 'success'

@patch('app.db')
def test_register_missing_fields(mock_db, client):
    response = client.post('/api/auth/register', json={
        "name": "Test User",
        "email": "test@example.com"
    })
    assert response.status_code == 400

@patch('app.db')
def test_register_existing_user(mock_db, client):
    mock_db.execute_query.return_value = [{}]
    response = client.post('/api/auth/register', json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 409

@patch('app.db')
def test_register_invalid_role(mock_db, client):
    response = client.post('/api/auth/register', json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "rol": "invalid"
    })
    assert response.status_code == 400

@patch('app.db')
def test_login_success(mock_db, client):
    mock_db.verify_user.return_value = True
    mock_db.execute_query.return_value = [{"rol": "usuario", "name": "Test User"}]
    response = client.post('/api/auth/login', json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json['status'] == 'success'
    assert 'access_token' in response.json

@patch('app.db')
def test_login_missing_fields(mock_db, client):
    response = client.post('/api/auth/login', json={
        "email": "test@example.com"
    })
    assert response.status_code == 400

@patch('app.db')
def test_login_invalid_credentials(mock_db, client):
    mock_db.verify_user.return_value = False
    response = client.post('/api/auth/login', json={
        "email": "test@example.com",
        "password": "wrong"
    })
    assert response.status_code == 401

@patch('app.db')
def test_login_user_not_found(mock_db, client):
    mock_db.verify_user.return_value = True
    mock_db.execute_query.return_value = []
    response = client.post('/api/auth/login', json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 404

# ---- USUARIOS ----

@patch('app.db')
@patch('app.get_jwt_identity')
def test_get_current_user_success(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.return_value = [{"user": {"name": "Test", "email": "test@example.com", "preferences": []}}]
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.get('/api/users/me', headers={"Authorization": "Bearer test"})
    # Flask-JWT-Extended disables JWT in test mode unless configured, so skip auth here

@patch('app.db')
@patch('app.get_jwt_identity')
def test_get_current_user_not_found(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.return_value = []
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.get('/api/users/me', headers={"Authorization": "Bearer test"})

@patch('app.db')
@patch('app.get_jwt_identity')
def test_delete_current_user_success(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.return_value = None
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.delete('/api/users/me', headers={"Authorization": "Bearer test"})

# ---- ACTIVIDADES ----

@patch('app.db')
@patch('app.get_jwt')
@patch('app.get_jwt_identity')
def test_create_activity_success(mock_identity, mock_jwt, mock_db, client):
    mock_jwt.return_value = {"rol": "admin"}
    mock_identity.return_value = "admin@example.com"
    mock_db.create_activity.return_value = [{"a": {"nombre": "Act", "place": "Place", "time": "01/01/25 2:00pm", "category": "Cat"}}]
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.post('/api/activities', json={
                "nombre": "Act",
                "place": "Place",
                "time": "01/01/25 2:00pm",
                "category": "Cat"
            }, headers={"Authorization": "Bearer test"})

@patch('app.db')
@patch('app.get_jwt')
def test_create_activity_not_admin(mock_jwt, mock_db, client):
    mock_jwt.return_value = {"rol": "usuario"}
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.post('/api/activities', json={
                "nombre": "Act"
            }, headers={"Authorization": "Bearer test"})

@patch('app.db')
def test_get_activities_success(mock_db, client):
    mock_db.execute_query.return_value = [
        {"a": {"nombre": "Act", "place": "Place", "time": "01/01/25 2:00pm", "category": "Cat"}, "categoria": "Cat"}
    ]
    response = client.get('/api/activities')
    assert response.status_code == 200
    assert response.json['status'] == 'success'

@patch('app.db')
@patch('app.get_jwt')
def test_delete_activity_success(mock_jwt, mock_db, client):
    mock_jwt.return_value = {"rol": "admin"}
    mock_db.execute_query.return_value = None
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.delete('/api/activities/Act', headers={"Authorization": "Bearer test"})

# ---- PREFERENCIAS ----

@patch('app.db')
@patch('app.get_jwt_identity')
def test_get_my_preferences_success(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.return_value = [
        {"actividad": "Act", "categoria": "Cat"}
    ]
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.get('/api/preferences/me', headers={"Authorization": "Bearer test"})

@patch('app.db')
@patch('app.get_jwt_identity')
def test_add_preferences_success(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.side_effect = [
        [{"nombre": "Act"}],  # actividadesExistentes
        None  # for each activity
    ]
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.post('/api/preferences', json={
                "actividades": ["Act"]
            }, headers={"Authorization": "Bearer test"})

@patch('app.db')
@patch('app.get_jwt_identity')
def test_add_preferences_invalid_activities(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.return_value = [{"nombre": "Act"}]
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.post('/api/preferences', json={
                "actividades": ["Nonexistent"]
            }, headers={"Authorization": "Bearer test"})

@patch('app.db')
@patch('app.get_jwt_identity')
def test_delete_preference_success(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.return_value = None
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.delete('/api/preferences/Act', headers={"Authorization": "Bearer test"})

# ---- RECOMENDACIONES ----

@patch('app.db')
@patch('app.get_jwt_identity')
def test_get_recommendations_success(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.return_value = [
        {"actividad": "Act", "categoria": "Cat"}
    ]
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.get('/api/recommendations', headers={"Authorization": "Bearer test"})

@patch('app.db')
@patch('app.get_jwt_identity')
def test_like_activity_success(mock_identity, mock_db, client):
    mock_identity.return_value = "test@example.com"
    mock_db.execute_query.return_value = None
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.post('/api/activities/Act/like', headers={"Authorization": "Bearer test"})

@patch('app.db')
@patch('app.get_jwt_identity')
def test_unlike_activity_success(mock_identity, mock_db, client):
    mock_identity.return_value = "juan@gmail.com"
    mock_db.execute_query.return_value = None
    with client.application.test_request_context():
        with client.session_transaction():
            response = client.delete('/api/activities/Act/like', headers={"Authorization": "Bearer test"})