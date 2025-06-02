import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../utils/backendUrl';

export default function PreferencesPage() {
  const [allActivities, setAllActivities] = useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Obtener todas las actividades
        const activitiesResponse = await fetch(backendUrl('/activities'), {
          method: 'GET'
        });

        if (!activitiesResponse.ok) {
          throw new Error('Error al obtener actividades');
        }

        const activitiesData = await activitiesResponse.json();
        setAllActivities(activitiesData.data);

        // Obtener preferencias del usuario
        const preferencesResponse = await fetch(backendUrl('/preferences/me'), {
          method: 'GET',
          headers: {
            Authorization: token
          }
        });

        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json();
          // Extraer todas las actividades de todas las categorías
          const userActivities = [];
          preferencesData.data.forEach(category => {
            userActivities.push(...category.actividades);
          });
          setUserPreferences(userActivities);
        }

      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePreference = async (activityName) => {
    const token = localStorage.getItem('token');
    const isCurrentlyPreferred = userPreferences.includes(activityName);

    try {
      if (isCurrentlyPreferred) {
        // Eliminar preferencia
        const response = await fetch(backendUrl(`/preferences/${activityName}`), {
          method: 'DELETE',
          headers: {
            Authorization: token
          }
        });

        if (response.ok) {
          setUserPreferences(prev => prev.filter(pref => pref !== activityName));
          setSuccess('Preferencia eliminada');
        }
      } else {
        // Agregar preferencia
        const response = await fetch(backendUrl('/preferences'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({
            actividades: [activityName]
          })
        });

        if (response.ok) {
          setUserPreferences(prev => [...prev, activityName]);
          setSuccess('Preferencia agregada');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error al actualizar preferencia');
    }

    // Limpiar mensajes después de 3 segundos
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  const saveAllPreferences = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(backendUrl('/preferences'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({
          actividades: userPreferences
        })
      });

      if (response.ok) {
        setSuccess('¡Preferencias guardadas exitosamente!');
      } else {
        setError('Error al guardar preferencias');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }

    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⚙️</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h1 className="text-2xl font-bold text-gray-900">Gestionar Preferencias</h1>
                <p className="text-gray-600 text-sm">Selecciona las actividades que más te gustan</p>
              </div>
            </div>
            <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
              {userPreferences.length} seleccionadas
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Mis Preferencias Actuales</h2>
              <p className="text-gray-600">
                Tienes {userPreferences.length} actividad{userPreferences.length !== 1 ? 'es' : ''} marcada{userPreferences.length !== 1 ? 's' : ''} como favorita{userPreferences.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/recommendations')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                🎯 Ver Recomendaciones
              </button>
              <button
                onClick={saveAllPreferences}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? 'Guardando...' : '💾 Guardar Todo'}
              </button>
            </div>
          </div>
        </div>

        {/* Current Preferences */}
        {userPreferences.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">❤️</span>
              Tus Actividades Favoritas
            </h3>
            <div className="flex flex-wrap gap-2">
              {userPreferences.map((pref, index) => (
                <span
                  key={index}
                  className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
                >
                  <span>{pref}</span>
                  <button
                    onClick={() => togglePreference(pref)}
                    className="text-green-600 hover:text-green-800 ml-2"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* All Activities by Category */}
        <div className="space-y-6">
          {allActivities.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-blue-600 p-4 text-white">
                <h3 className="text-lg font-bold flex items-center">
                  <span className="mr-3">📂</span>
                  {category.categoria}
                </h3>
                <p className="text-blue-100 mt-1 text-sm">
                  {category.actividades.length} actividad{category.actividades.length !== 1 ? 'es' : ''} disponible{category.actividades.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.actividades.map((activity, activityIndex) => {
                    const isSelected = userPreferences.includes(activity.nombre);
                    return (
                      <div
                        key={activityIndex}
                        onClick={() => togglePreference(activity.nombre)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {activity.nombre}
                            </h4>
                            {activity.place && (
                              <p className="text-sm text-gray-600 mb-1">
                                📍 {activity.place}
                              </p>
                            )}
                            {activity.time && (
                              <p className="text-sm text-gray-600">
                                🕐 {activity.time}
                              </p>
                            )}
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                            isSelected
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {allActivities.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay actividades disponibles</h3>
            <p className="text-gray-600 mb-6">Parece que no hay actividades registradas en el sistema.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}