import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import backendUrl from '../utils/backendUrl';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al escribir
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (formData.password.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(backendUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro exitoso, redirigir al login
        navigate('/login', { 
          state: { message: '¡Registro exitoso! Ahora puedes iniciar sesión.' }
        });
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-white">🎯</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Únete a EduRecom!</h2>
          <p className="text-gray-600">Crea tu cuenta y descubre actividades increíbles</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 3 caracteres"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creando cuenta...
              </div>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 text-lg">ℹ️</span>
            <div>
              <h4 className="text-blue-900 font-semibold text-sm mb-1">¿Qué puedes hacer en EduRecom?</h4>
              <ul className="text-blue-800 text-xs space-y-1">
                <li>• Configurar tus actividades favoritas</li>
                <li>• Recibir recomendaciones personalizadas</li>
                <li>• Descubrir nuevas experiencias</li>
                <li>• Conectar con actividades que te gustan</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}