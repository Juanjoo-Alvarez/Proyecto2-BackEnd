import { useState, useEffect, useRef } from 'react';
import backendUrl from '../utils/backendUrl';

export default function GlobalSearch({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    activities: [],
    categories: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    // Cargar búsquedas recientes del localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Cerrar búsqueda al hacer clic fuera
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Buscar automáticamente al escribir
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults({ activities: [], categories: [], recommendations: [] });
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Buscar en actividades
      const activitiesResponse = await fetch(backendUrl('/activities'), {
        headers: { Authorization: token }
      });

      let allActivities = [];
      let categories = new Set();
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        
        // Extraer todas las actividades y categorías
        activitiesData.data.forEach(categoryGroup => {
          categories.add(categoryGroup.categoria);
          categoryGroup.actividades.forEach(activity => {
            allActivities.push({
              ...activity,
              categoria: categoryGroup.categoria
            });
          });
        });
      }

      // Filtrar resultados por query
      const queryLower = query.toLowerCase();
      
      const filteredActivities = allActivities.filter(activity => 
        activity.nombre.toLowerCase().includes(queryLower) ||
        activity.place.toLowerCase().includes(queryLower) ||
        activity.categoria.toLowerCase().includes(queryLower)
      );

      const filteredCategories = Array.from(categories).filter(category =>
        category.toLowerCase().includes(queryLower)
      );

      // Buscar en recomendaciones si hay token
      let recommendations = [];
      try {
        const recsResponse = await fetch(backendUrl('/recommendations'), {
          headers: { Authorization: token }
        });
        
        if (recsResponse.ok) {
          const recsData = await recsResponse.json();
          recsData.data.forEach(categoryGroup => {
            categoryGroup.actividades.forEach(activityName => {
              const activityDetails = allActivities.find(act => act.nombre === activityName);
              if (activityDetails && activityName.toLowerCase().includes(queryLower)) {
                recommendations.push({
                  ...activityDetails,
                  isRecommendation: true
                });
              }
            });
          });
        }
      } catch (e) {
        // Ignorar errores de recomendaciones
      }

      setSearchResults({
        activities: filteredActivities.slice(0, 8),
        categories: filteredCategories.slice(0, 5),
        recommendations: recommendations.slice(0, 3)
      });

    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleActivityClick = (activity) => {
    saveRecentSearch(searchQuery);
    setIsOpen(false);
    setSearchQuery('');
    // Navegar a preferencias
    if (onNavigate) {
      onNavigate('/preferences', { highlightActivity: activity.nombre });
    }
  };

  const handleCategoryClick = (category) => {
    saveRecentSearch(searchQuery);
    setIsOpen(false);
    setSearchQuery('');
    // Navegar a recomendaciones con filtro de categoría
    if (onNavigate) {
      onNavigate('/recommendations', { categoryFilter: category });
    }
  };

  const handleRecommendationClick = (activity) => {
    saveRecentSearch(searchQuery);
    setIsOpen(false);
    setSearchQuery('');
    if (onNavigate) {
      onNavigate('/recommendations', { highlightActivity: activity.nombre });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar actividades, categorías, lugares..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full md:w-96 px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <span className="text-gray-400 text-lg">🔍</span>
          )}
        </div>
        
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults({ activities: [], categories: [], recommendations: [] });
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {searchQuery.length < 2 ? (
            // Recent searches and suggestions
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center">
                      <span className="mr-2">🕐</span>
                      Búsquedas recientes
                    </h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(search);
                          performSearch(search);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700 transition-colors"
                      >
                        🔍 {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Sugerencias de búsqueda
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSearchQuery('Deportes')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700 transition-colors"
                  >
                    🏃 Actividades deportivas
                  </button>
                  <button
                    onClick={() => setSearchQuery('Arte')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700 transition-colors"
                  >
                    🎨 Actividades artísticas
                  </button>
                  <button
                    onClick={() => setSearchQuery('hoy')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700 transition-colors"
                  >
                    📅 Actividades de hoy
                  </button>
                  <button
                    onClick={() => onNavigate && onNavigate('/recommendations')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700 transition-colors"
                  >
                    ✨ Ver mis recomendaciones
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Search results
            <div className="p-4">
              {/* Activities */}
              {searchResults.activities.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    Actividades ({searchResults.activities.length})
                  </h4>
                  <div className="space-y-1">
                    {searchResults.activities.map((activity, index) => (
                      <button
                        key={index}
                        onClick={() => handleActivityClick(activity)}
                        className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded transition-colors border-l-4 border-transparent hover:border-blue-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{activity.nombre}</h5>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="mr-4">📍 {activity.place}</span>
                              <span className="mr-4">🕐 {activity.time}</span>
                              <span>📂 {activity.categoria}</span>
                            </div>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Ver
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {searchResults.recommendations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <span className="mr-2">✨</span>
                    En tus recomendaciones ({searchResults.recommendations.length})
                  </h4>
                  <div className="space-y-1">
                    {searchResults.recommendations.map((activity, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecommendationClick(activity)}
                        className="w-full text-left px-3 py-3 hover:bg-green-50 rounded transition-colors border-l-4 border-transparent hover:border-green-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{activity.nombre}</h5>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="mr-4">📍 {activity.place}</span>
                              <span className="mr-4">🕐 {activity.time}</span>
                              <span>📂 {activity.categoria}</span>
                            </div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Recomendado
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {searchResults.categories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <span className="mr-2">📂</span>
                    Categorías ({searchResults.categories.length})
                  </h4>
                  <div className="space-y-1">
                    {searchResults.categories.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => handleCategoryClick(category)}
                        className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded transition-colors border-l-4 border-transparent hover:border-purple-500"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">🎪 {category}</span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Ver todas
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {searchQuery.length >= 2 && 
               searchResults.activities.length === 0 && 
               searchResults.categories.length === 0 && 
               searchResults.recommendations.length === 0 && 
               !loading && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <h4 className="font-bold text-gray-900 mb-2">No se encontraron resultados</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    No encontramos actividades que coincidan con "{searchQuery}"
                  </p>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => onNavigate && onNavigate('/preferences')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Ver todas las actividades
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setIsOpen(false);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              {searchQuery.length >= 2 && (
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Acciones rápidas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        onNavigate && onNavigate('/recommendations');
                        setIsOpen(false);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs transition-colors"
                    >
                      🎯 Ver recomendaciones
                    </button>
                    <button
                      onClick={() => {
                        onNavigate && onNavigate('/preferences');
                        setIsOpen(false);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs transition-colors"
                    >
                      ⚙️ Configurar preferencias
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}