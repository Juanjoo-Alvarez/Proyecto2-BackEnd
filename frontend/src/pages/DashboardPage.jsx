import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../utils/backendUrl';
import GlobalSearch from '../components/GlobalSearch';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStats, setUserStats] = useState({
    totalPreferences: 0,
    favoriteCategory: '',
    categoriesDistribution: [],
    recentActivity: ''
  });
  const [popularActivities, setPopularActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Actualizar reloj cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchPopularActivities();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener preferencias del usuario
      const preferencesResponse = await fetch(backendUrl('/preferences/me'), {
        headers: { Authorization: token }
      });

      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        
        // Calcular estadísticas
        let totalPreferences = 0;
        const categoryCounts = {};
        
        preferencesData.data.forEach(category => {
          const count = category.actividades.length;
          totalPreferences += count;
          categoryCounts[category.categoria] = count;
        });

        // Encontrar categoría favorita
        const favoriteCategory = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ninguna';

        // Crear distribución para visualización
        const categoriesDistribution = Object.entries(categoryCounts)
          .map(([category, count]) => ({
            category,
            count,
            percentage: totalPreferences > 0 ? Math.round((count / totalPreferences) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count);

        setUserStats({
          totalPreferences,
          favoriteCategory,
          categoriesDistribution,
          recentActivity: totalPreferences > 0 ? 'Activo' : 'Sin actividad'
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(backendUrl('/activities/popular'), {
        headers: { Authorization: token }
      });

      if (response.ok) {
        const data = await response.json();
        setPopularActivities(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching popular activities:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ¡Hola, {user?.name}!
                </h1>
                <p className="text-gray-600 text-sm">
                  {user?.rol === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                </p>
              </div>
            </div>
            
            {/* Global Search */}
            <div className="flex-1 max-w-lg mx-8">
              <GlobalSearch onNavigate={navigate} />
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Welcome Banner with Clock */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
              <p className="text-blue-100 text-lg">
                {formatDate(currentTime)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono font-bold mb-2">
                {formatTime(currentTime)}
              </div>
              <p className="text-blue-100 text-sm">Hora actual</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Preferences */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Actividades Favoritas</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.totalPreferences}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {userStats.totalPreferences > 0 ? 'Configurado' : 'Sin configurar'}
            </p>
          </div>

          {/* Favorite Category */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Categoría Favorita</p>
                <p className="text-lg font-bold text-gray-900">{userStats.favoriteCategory}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Más preferida
            </p>
          </div>

          {/* Activity Status */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Estado</p>
                <p className="text-lg font-bold text-gray-900">{userStats.recentActivity}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Perfil de usuario
            </p>
          </div>

          {/* Quick Action */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Recomendaciones</p>
                <p className="text-lg font-bold text-gray-900">Disponibles</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/recommendations')}
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 font-medium"
            >
              Ver ahora →
            </button>
          </div>
        </div>

        {/* Categories Distribution */}
        {userStats.categoriesDistribution.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Distribución por Categorías
            </h3>
            <div className="space-y-4">
              {userStats.categoriesDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎪</span>
                    <span className="font-medium text-gray-900">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Preferences */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => navigate('/preferences')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <span className="text-green-600 text-sm font-medium">
                {userStats.totalPreferences} configuradas
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Gestionar Preferencias</h3>
            <p className="text-gray-600 text-sm mb-4">
              Configura tus actividades favoritas para recibir mejores recomendaciones personalizadas.
            </p>
            <div className="flex items-center text-green-600 font-medium text-sm">
              <span>Configurar ahora</span>
              <span className="ml-2">→</span>
            </div>
          </div>

          {/* Get Recommendations */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => navigate('/recommendations')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <span className="text-purple-600 text-sm font-medium">
                Actualizado
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ver Recomendaciones</h3>
            <p className="text-gray-600 text-sm mb-4">
              Descubre nuevas actividades perfectas para ti basadas en tus gustos y preferencias.
            </p>
            <div className="flex items-center text-purple-600 font-medium text-sm">
              <span>Explorar actividades</span>
              <span className="ml-2">→</span>
            </div>
          </div>

          {/* Admin Panel */}
          {user?.rol === 'admin' && (
            <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/admin')}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <span className="text-red-600 text-sm font-medium">
                  Admin
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Panel de Administración</h3>
              <p className="text-gray-600 text-sm mb-4">
                Gestionar actividades, usuarios y ver estadísticas del sistema.
              </p>
              <div className="flex items-center text-red-600 font-medium text-sm">
                <span>Acceder al panel</span>
                <span className="ml-2">→</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Consejos para aprovechar al máximo EduRecom</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Configura al menos 3-5 actividades favoritas para mejores recomendaciones</li>
                <li>• Explora diferentes categorías para descubrir nuevos intereses</li>
                <li>• Revisa las recomendaciones regularmente, se actualizan según tus gustos</li>
                <li>• Usa el botón "Me gusta" en las recomendaciones para refinar tu perfil</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}