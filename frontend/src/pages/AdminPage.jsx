import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../utils/backendUrl';
import UserManagement from '../components/UserManagement';

export default function AdminPage() {
  const [activities, setActivities] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalActivities: 0,
    totalUsers: 0,
    totalPreferences: 0,
    popularActivities: [],
    categoriesCount: {},
    recentActivity: []
  });
  const [newActivity, setNewActivity] = useState({
    nombre: '',
    place: '',
    time: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [editingActivity, setEditingActivity] = useState(null);
  const navigate = useNavigate();

  const predefinedCategories = [
    'Deportes', 'Arte', 'Estrategia', 'Música', 'Tecnología', 
    'Cocina', 'Fotografía', 'Lectura', 'Baile', 'Naturaleza'
  ];

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener actividades
      const activitiesResponse = await fetch(backendUrl('/activities'), {
        headers: { Authorization: token }
      });

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.data);
        
        // Calcular estadísticas
        let totalActivities = 0;
        const categoriesCount = {};
        
        activitiesData.data.forEach(category => {
          const count = category.actividades.length;
          totalActivities += count;
          categoriesCount[category.categoria] = count;
        });

        // Obtener estadísticas del sistema (simuladas por ahora)
        setSystemStats(prev => ({
          ...prev,
          totalActivities,
          categoriesCount,
          totalUsers: 4, // Hardcodeado por ahora
          totalPreferences: 15 // Hardcodeado por ahora
        }));
      }

    } catch (err) {
      console.error(err);
      setError('Error al cargar datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    
    if (!newActivity.nombre || !newActivity.place || !newActivity.time || !newActivity.category) {
      setError('Todos los campos son requeridos');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(backendUrl('/activities'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(newActivity)
      });

      if (response.ok) {
        setSuccess('Actividad creada exitosamente');
        setNewActivity({ nombre: '', place: '', time: '', category: '' });
        fetchSystemData();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear actividad');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (activityName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${activityName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(backendUrl(`/activities/${activityName}`), {
        method: 'DELETE',
        headers: { Authorization: token }
      });

      if (response.ok) {
        setSuccess('Actividad eliminada exitosamente');
        fetchSystemData();
      } else {
        setError('Error al eliminar actividad');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    }
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setNewActivity({
      nombre: activity.nombre,
      place: activity.place,
      time: activity.time,
      category: activity.category
    });
    setActiveTab('manage');
  };

  const cancelEdit = () => {
    setEditingActivity(null);
    setNewActivity({ nombre: '', place: '', time: '', category: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
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
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Dashboard</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">👑</span>
                  Panel de Administración
                </h1>
                <p className="text-gray-600 text-sm">Gestiona actividades y monitorea el sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Resumen General
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'manage'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚙️ Gestionar Actividades
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 Gestionar Usuarios
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'stats'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📈 Estadísticas Detalladas
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Actividades</p>
                        <p className="text-3xl font-bold">{systemStats.totalActivities}</p>
                      </div>
                      <div className="text-3xl opacity-80">🎯</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Usuarios Activos</p>
                        <p className="text-3xl font-bold">{systemStats.totalUsers}</p>
                      </div>
                      <div className="text-3xl opacity-80">👥</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Categorías</p>
                        <p className="text-3xl font-bold">{Object.keys(systemStats.categoriesCount).length}</p>
                      </div>
                      <div className="text-3xl opacity-80">📂</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Preferencias</p>
                        <p className="text-3xl font-bold">{systemStats.totalPreferences}</p>
                      </div>
                      <div className="text-3xl opacity-80">❤️</div>
                    </div>
                  </div>
                </div>

                {/* Categories Distribution */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Distribución por Categorías
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(systemStats.categoriesCount).map(([category, count]) => {
                      const percentage = systemStats.totalActivities > 0 
                        ? Math.round((count / systemStats.totalActivities) * 100) 
                        : 0;
                      
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🎪</span>
                            <span className="font-medium text-gray-900">{category}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-16 text-right">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">⚡</span>
                    Acciones Rápidas
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('manage')}
                      className="bg-blue-50 hover:bg-blue-100 border border-blue-200 p-4 rounded-lg transition-colors text-left"
                    >
                      <div className="text-2xl mb-2">➕</div>
                      <h4 className="font-bold text-blue-900">Crear Actividad</h4>
                      <p className="text-blue-700 text-sm">Agregar nueva actividad al sistema</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-purple-50 hover:bg-purple-100 border border-purple-200 p-4 rounded-lg transition-colors text-left"
                    >
                      <div className="text-2xl mb-2">👥</div>
                      <h4 className="font-bold text-purple-900">Gestionar Usuarios</h4>
                      <p className="text-purple-700 text-sm">Administrar usuarios del sistema</p>
                    </button>

                    <button
                      onClick={() => window.location.reload()}
                      className="bg-green-50 hover:bg-green-100 border border-green-200 p-4 rounded-lg transition-colors text-left"
                    >
                      <div className="text-2xl mb-2">🔄</div>
                      <h4 className="font-bold text-green-900">Actualizar Datos</h4>
                      <p className="text-green-700 text-sm">Refrescar estadísticas del sistema</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('stats')}
                      className="bg-orange-50 hover:bg-orange-100 border border-orange-200 p-4 rounded-lg transition-colors text-left"
                    >
                      <div className="text-2xl mb-2">📈</div>
                      <h4 className="font-bold text-orange-900">Ver Estadísticas</h4>
                      <p className="text-orange-700 text-sm">Análisis detallado del sistema</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="space-y-6">
                {/* Create/Edit Activity Form */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">{editingActivity ? '✏️' : '➕'}</span>
                    {editingActivity ? 'Editar Actividad' : 'Crear Nueva Actividad'}
                  </h3>
                  
                  <form onSubmit={handleCreateActivity} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🎯 Nombre de la actividad
                        </label>
                        <input
                          type="text"
                          value={newActivity.nombre}
                          onChange={(e) => setNewActivity({ ...newActivity, nombre: e.target.value })}
                          placeholder="Ej: Fútbol, Pintura, Ajedrez"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📍 Lugar
                        </label>
                        <input
                          type="text"
                          value={newActivity.place}
                          onChange={(e) => setNewActivity({ ...newActivity, place: e.target.value })}
                          placeholder="Ej: Campo Doroteo Gamuch, Aula 101"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🕐 Fecha y hora
                        </label>
                        <input
                          type="text"
                          value={newActivity.time}
                          onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                          placeholder="Ej: 02/06/25 4:00pm"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📂 Categoría
                        </label>
                        <select
                          value={newActivity.category}
                          onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          required
                        >
                          <option value="">Seleccionar categoría</option>
                          {predefinedCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
                      >
                        {submitting ? 'Guardando...' : editingActivity ? '💾 Actualizar' : '➕ Crear Actividad'}
                      </button>
                      
                      {editingActivity && (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Activities List */}
                <div className="bg-white border rounded-lg">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <span className="mr-2">📋</span>
                      Actividades Existentes ({systemStats.totalActivities})
                    </h3>
                  </div>
                  
                  <div className="divide-y">
                    {activities.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="p-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                          <span className="mr-2">🎪</span>
                          {category.categoria} ({category.actividades.length})
                        </h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          {category.actividades.map((activity, activityIndex) => (
                            <div
                              key={activityIndex}
                              className="bg-gray-50 p-4 rounded-lg border hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-900 mb-2">{activity.nombre}</h5>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p className="flex items-center">
                                      <span className="mr-2">📍</span>
                                      {activity.place}
                                    </p>
                                    <p className="flex items-center">
                                      <span className="mr-2">🕐</span>
                                      {activity.time}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => handleEditActivity(activity)}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteActivity(activity.nombre)}
                                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                                  >
                                    🗑️ Eliminar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <UserManagement />
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📈</span>
                    Estadísticas Detalladas del Sistema
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800">📊 Métricas Generales</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-gray-700">Total de actividades:</span>
                          <span className="font-bold text-blue-600">{systemStats.totalActivities}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-gray-700">Usuarios registrados:</span>
                          <span className="font-bold text-green-600">{systemStats.totalUsers}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-gray-700">Categorías activas:</span>
                          <span className="font-bold text-purple-600">{Object.keys(systemStats.categoriesCount).length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-gray-700">Total preferencias:</span>
                          <span className="font-bold text-orange-600">{systemStats.totalPreferences}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800">🏆 Top Categorías</h4>
                      <div className="space-y-3">
                        {Object.entries(systemStats.categoriesCount)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([category, count], index) => (
                            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                                </span>
                                <span className="text-gray-700">{category}</span>
                              </div>
                              <span className="font-bold text-blue-600">{count} actividades</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-2">Consejos para Administradores</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Mantén un balance entre diferentes categorías de actividades</li>
                        <li>• Revisa regularmente qué actividades son más populares</li>
                        <li>• Considera crear actividades en horarios variados</li>
                        <li>• El sistema funciona mejor con al menos 5-10 actividades por categoría</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}