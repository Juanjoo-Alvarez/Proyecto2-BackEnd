import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import backendUrl from '../utils/backendUrl';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mensaje de éxito del registro
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al escribir
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(backendUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🎯</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            ¡Bienvenido de vuelta!
          </h2>
          <p className="text-gray-700 font-medium">Inicia sesión para descubrir nuevas actividades</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-4 rounded-xl shadow-lg">
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              📧 Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full p-4 border-3 border-purple-300 rounded-xl focus:outline-none focus:border-pink-500 transition-all bg-purple-50 text-gray-800 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              🔒 Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              className="w-full p-4 border-3 border-purple-300 rounded-xl focus:outline-none focus:border-pink-500 transition-all bg-purple-50 text-gray-800 font-medium"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white p-4 rounded-xl shadow-lg">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3"></div>
                Iniciando sesión...
              </div>
            ) : (
              '🚀 Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-700 font-medium">
            ¿No tienes cuenta?{' '}
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
          <p className="text-sm text-center mb-2 font-bold">
            🎮 Credenciales de prueba:
          </p>
          <div className="text-xs space-y-1 font-medium">
            <p><strong>👤 Usuario:</strong> usuario@test.com | contraseña: 123</p>
            <p><strong>👑 Admin:</strong> admin@test.com | contraseña: 123</p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-purple-600 hover:text-pink-600 font-bold transition-all transform hover:scale-105"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}