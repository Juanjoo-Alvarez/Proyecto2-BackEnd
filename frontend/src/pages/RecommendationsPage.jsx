import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../utils/backendUrl';

// Componente de filtros integrado
const FiltersComponent = ({ onFiltersChange, allActivities = [] }) => {
  const [filters, setFilters] = useState({
    category: 'all',
    timeFilter: 'all',
    dateFilter: 'all',
    sortBy: 'recommendation'
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const categories = new Set();
    allActivities.forEach(categoryGroup => {
      if (categoryGroup.categoria) {
        categories.add(categoryGroup.categoria);
      }
    });
    setAvailableCategories(Array.from(categories));
  }, [allActivities]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: 'all',
      timeFilter: 'all',
      dateFilter: 'all',
      sortBy: 'recommendation'
    };
    setFilters(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== 'all' && value !== 'recommendation').length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🔍</span>
            <h3 className="text-lg font-bold text-gray-900">Filtros de Búsqueda</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {getActiveFiltersCount()} activo{getActiveFiltersCount() !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
            >
              <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📂 Categoría</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="all">Todas las categorías</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🕐 Horario</label>
              <select
                value={filters.timeFilter}
                onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="all">Cualquier horario</option>
                <option value="morning">Mañana (6am - 12pm)</option>
                <option value="afternoon">Tarde (12pm - 6pm)</option>
                <option value="evening">Noche (6pm - 10pm)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Fecha</label>
              <select
                value={filters.dateFilter}
                onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="all">Cualquier fecha</option>
                <option value="today">Hoy</option>
                <option value="tomorrow">Mañana</option>
                <option value="week">Esta semana</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📊 Ordenar por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="recommendation">Relevancia</option>
                <option value="category">Categoría</option>
                <option value="name">Nombre A-Z</option>
                <option value="time">Hora más próxima</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-3">🚀 Filtros rápidos:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({...filters, timeFilter: 'afternoon', dateFilter: 'today'})}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              >
                🌅 Hoy por la tarde
              </button>
              <button
                onClick={() => setFilters({...filters, dateFilter: 'week'})}
                className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              >
                📅 Esta semana
              </button>
              <button
                onClick={() => setFilters({...filters, category: 'Deportes'})}
                className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              >
                ⚽ Solo deportes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liking, setLiking] = useState({});
  const [currentFilters, setCurrentFilters] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const allActivitiesResponse = await fetch(backendUrl('/activities'), {
          method: 'GET'
        });

        if (allActivitiesResponse.ok) {
          const allActivitiesData = await allActivitiesResponse.json();
          setAllActivities(allActivitiesData.data);
        }

        const recommendationsResponse = await fetch(backendUrl('/recommendations'), {
          method: 'GET',
          headers: { Authorization: token }
        });

        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          setRecommendations(recommendationsData.data);
          setFilteredRecommendations(recommendationsData.data);
        }

        const preferencesResponse = await fetch(backendUrl('/preferences/me'), {
          method: 'GET',
          headers: { Authorization: token }
        });

        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json();
          const userActivities = [];
          preferencesData.data.forEach(category => {
            userActivities.push(...category.actividades);
          });
          setUserPreferences(userActivities);
        }

      } catch (err) {
        console.error(err);
        setError('Error al cargar las recomendaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityDetails = (activityName) => {
    for (const category of allActivities) {
      const activity = category.actividades.find(act => act.nombre === activityName);
      if (activity) {
        return activity;
      }
    }
    return { nombre: activityName };
  };

  const parseTimeForFiltering = (timeString) => {
    if (!timeString) return null;
    
    try {
      const timePart = timeString.split(' ').pop();
      let hour = 12;
      
      if (timePart.includes(':')) {
        const [hourStr, minuteAndPeriod] = timePart.split(':');
        hour = parseInt(hourStr);
        
        if (minuteAndPeriod.toLowerCase().includes('pm') && hour !== 12) {
          hour += 12;
        } else if (minuteAndPeriod.toLowerCase().includes('am') && hour === 12) {
          hour = 0;
        }
      }
      
      return hour;
    } catch (e) {
      return null;
    }
  };

  const applyFilters = (filters) => {
    setCurrentFilters(filters);
    
    let filtered = recommendations.map(category => {
      let filteredActivities = category.actividades.filter(activityName => {
        const activity = getActivityDetails(activityName);
        
        // Filter by category
        if (filters.category !== 'all' && category.categoria !== filters.category) {
          return false;
        }
        
        // Filter by time
        if (filters.timeFilter !== 'all') {
          const hour = parseTimeForFiltering(activity.time);
          if (hour !== null) {
            switch (filters.timeFilter) {
              case 'morning':
                if (hour < 6 || hour >= 12) return false;
                break;
              case 'afternoon':
                if (hour < 12 || hour >= 18) return false;
                break;
              case 'evening':
                if (hour < 18 || hour >= 22) return false;
                break;
            }
          }
        }
        
        return true;
      });

      // Sort activities
      if (filters.sortBy === 'name') {
        filteredActivities.sort();
      } else if (filters.sortBy === 'time') {
        filteredActivities.sort((a, b) => {
          const timeA = parseTimeForFiltering(getActivityDetails(a).time) || 24;
          const timeB = parseTimeForFiltering(getActivityDetails(b).time) || 24;
          return timeA - timeB;
        });
      }

      return {
        ...category,
        actividades: filteredActivities
      };
    }).filter(category => category.actividades.length > 0);

    // Sort categories
    if (filters.sortBy === 'category') {
      filtered.sort((a, b) => a.categoria.localeCompare(b.categoria));
    }

    setFilteredRecommendations(filtered);
  };

  const handleLikeActivity = async (activityName) => {
    const token = localStorage.getItem('token');
    setLiking(prev => ({ ...prev, [activityName]: true }));

    try {
      const response = await fetch(backendUrl(`/activities/${activityName}/like`), {
        method: 'POST',
        headers: { Authorization: token }
      });

      if (response.ok) {
        setUserPreferences(prev => [...prev, activityName]);
      } else {
        setError('Error al marcar como favorita');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setLiking(prev => ({ ...prev, [activityName]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando recomendaciones personalizadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recomendaciones Personalizadas</h1>
                <p className="text-gray-600 text-sm">Actividades perfectas para ti basadas en tus gustos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <span className="mr-3">🎯</span>
                Descubre Nuevas Actividades
              </h2>
              <p className="text-blue-100 mb-4">
                Recomendaciones basadas en tus preferencias y patrones de usuarios similares
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  ❤️ {userPreferences.length} preferencias
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  🎯 {filteredRecommendations.reduce((total, cat) => total + cat.actividades.length, 0)} recomendaciones
                </span>
              </div>
            </div>
            <div className="text-4xl opacity-30">✨</div>
          </div>
        </div>

        <FiltersComponent 
          onFiltersChange={applyFilters}
          allActivities={recommendations}
        />

        {userPreferences.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">¡Configura tus preferencias primero!</h3>
                <p className="text-yellow-700 mb-4">
                  Para obtener recomendaciones más precisas, configura al menos algunas actividades favoritas.
                </p>
                <button
                  onClick={() => navigate('/preferences')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Configurar Preferencias
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredRecommendations.length > 0 ? (
          <div className="space-y-6">
            {filteredRecommendations.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-green-600 p-4 text-white">
                  <h3 className="text-lg font-bold flex items-center">
                    <span className="mr-3">🎪</span>
                    {category.categoria}
                  </h3>
                  <p className="text-green-100 mt-1 text-sm">
                    {category.actividades.length} actividad{category.actividades.length !== 1 ? 'es' : ''} encontrada{category.actividades.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.actividades.map((activityName, activityIndex) => {
                      const activityDetails = getActivityDetails(activityName);
                      const isAlreadyLiked = userPreferences.includes(activityName);
                      const isLiking = liking[activityName];
                      
                      return (
                        <div
                          key={activityIndex}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                                <span className="mr-2">🎯</span>
                                {activityDetails.nombre}
                              </h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                {activityDetails.place && (
                                  <p className="flex items-center">
                                    <span className="mr-2">📍</span>
                                    {activityDetails.place}
                                  </p>
                                )}
                                {activityDetails.time && (
                                  <p className="flex items-center">
                                    <span className="mr-2">🕐</span>
                                    {activityDetails.time}
                                  </p>
                                )}
                                <p className="flex items-center">
                                  <span className="mr-2">📂</span>
                                  {category.categoria}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              <span className="mr-1">✨</span>
                              Recomendado
                            </div>
                            
                            {isAlreadyLiked ? (
                              <div className="flex items-center text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                <span className="mr-1">❤️</span>
                                Favorita
                              </div>
                            ) : (
                              <button
                                onClick={() => handleLikeActivity(activityName)}
                                disabled={isLiking}
                                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                              >
                                {isLiking ? '...' : '❤️ Me gusta'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {Object.values(currentFilters).some(v => v !== 'all' && v !== 'recommendation') 
                ? 'No se encontraron actividades con estos filtros' 
                : 'No hay recomendaciones disponibles'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {Object.values(currentFilters).some(v => v !== 'all' && v !== 'recommendation')
                ? 'Intenta ajustar los filtros para ver más resultados.'
                : userPreferences.length === 0 
                  ? "Configura algunas preferencias para recibir recomendaciones personalizadas."
                  : "El sistema está analizando tus gustos. Las recomendaciones aparecerán cuando haya más actividades compatibles."
              }
            </p>
            <button
              onClick={() => navigate('/preferences')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              ⚙️ Configurar Preferencias
            </button>
          </div>
        )}
      </div>
    </div>
  );
}