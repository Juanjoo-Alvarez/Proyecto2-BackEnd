import { useState, useEffect } from 'react';
import backendUrl from '../utils/backendUrl';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Simular obtención de usuarios (ajustar endpoint según tu backend)
      // Por ahora usaremos datos simulados
      const mockUsers = [
        {
          id: 1,
          name: 'Juan Administrador',
          email: 'admin@test.com',
          rol: 'admin',
          created_at: '2024-01-15',
          last_login: '2024-06-01',
          status: 'active',
          preferences_count: 0,
          recommendations_count: 0
        },
        {
          id: 2,
          name: 'Julio Usuario',
          email: 'julio@test.com',
          rol: 'user',
          created_at: '2024-02-20',
          last_login: '2024-06-01',
          status: 'active',
          preferences_count: 3,
          recommendations_count: 2
        },
        {
          id: 3,
          name: 'Maria Estudiante',
          email: 'maria@test.com',
          rol: 'user',
          created_at: '2024-03-10',
          last_login: '2024-05-30',
          status: 'active',
          preferences_count: 3,
          recommendations_count: 1
        },
        {
          id: 4,
          name: 'Pedro López',
          email: 'pedro@test.com',
          rol: 'user',
          created_at: '2024-03-15',
          last_login: '2024-05-28',
          status: 'active',
          preferences_count: 2,
          recommendations_count: 1
        },
        {
          id: 5,
          name: 'Ana García',
          email: 'ana@test.com',
          rol: 'user',
          created_at: '2024-04-01',
          last_login: '2024-06-01',
          status: 'active',
          preferences_count: 3,
          recommendations_count: 2
        }
      ];

      setUsers(mockUsers);

      // Calcular estadísticas
      const stats = {
        total: mockUsers.length,
        admins: mockUsers.filter(u => u.rol === 'admin').length,
        users: mockUsers.filter(u => u.rol === 'user').length,
        active: mockUsers.filter(u => u.status === 'active').length,
        totalPreferences: mockUsers.reduce((sum, u) => sum + u.preferences_count, 0),
        avgPreferences: mockUsers.length > 0 ? 
          (mockUsers.reduce((sum, u) => sum + u.preferences_count, 0) / mockUsers.length).toFixed(1) : 0
      };

      setUserStats(stats);

    } catch (err) {
      console.error(err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      // Simular eliminación
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSuccess('Usuario eliminado exitosamente');
    } catch (err) {
      setError('Error al eliminar usuario');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      // Simular cambio de rol
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, rol: newRole } : user
      ));
      setSuccess(`Rol actualizado a ${newRole}`);
    } catch (err) {
      setError('Error al cambiar rol');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      // Simular cambio de status
      setUsers(prev => prev.map(user => 
        user.id === userId ? { 
          ...user, 
          status: user.status === 'active' ? 'inactive' : 'active' 
        } : user
      ));
      setSuccess('Estado actualizado');
    } catch (err) {
      setError('Error al cambiar estado');
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.rol === filterRole;
      return matchesSearch && matchesRole;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'role':
          return a.rol.localeCompare(b.rol);
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'preferences':
          return b.preferences_count - a.preferences_count;
        default:
          return 0;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredAndSortedUsers();

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
              <p className="text-3xl font-bold">{userStats.total}</p>
            </div>
            <div className="text-3xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Administradores</p>
              <p className="text-3xl font-bold">{userStats.admins}</p>
            </div>
            <div className="text-3xl opacity-80">👑</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Usuarios Activos</p>
              <p className="text-3xl font-bold">{userStats.active}</p>
            </div>
            <div className="text-3xl opacity-80">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Prom. Preferencias</p>
              <p className="text-3xl font-bold">{userStats.avgPreferences}</p>
            </div>
            <div className="text-3xl opacity-80">❤️</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            {/* Filters */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuarios</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="email">Ordenar por email</option>
              <option value="role">Ordenar por rol</option>
              <option value="created">Ordenar por fecha</option>
              <option value="preferences">Ordenar por preferencias</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preferencias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg">
                          {user.rol === 'admin' ? '👑' : '👤'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.rol}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status === 'active' ? '✅ Activo' : '❌ Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-2">❤️</span>
                      {user.preferences_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openUserModal(user)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-xs transition-colors"
                    >
                      👁️ Ver
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-xs transition-colors"
                      disabled={user.rol === 'admin'}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay usuarios registrados en el sistema'
              }
            </p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="mr-2">👤</span>
                  Detalles del Usuario
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">Información Personal</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre</label>
                      <p className="text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rol</label>
                      <p className="text-gray-900 capitalize">{selectedUser.rol}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <p className={`font-medium ${
                        selectedUser.status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedUser.status === 'active' ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-3">Estadísticas de Actividad</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.preferences_count}</div>
                      <div className="text-sm text-blue-700">Preferencias</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.recommendations_count}</div>
                      <div className="text-sm text-blue-700">Recomendaciones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor((new Date() - new Date(selectedUser.created_at)) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-blue-700">Días registrado</div>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de registro</label>
                    <p className="text-gray-900">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Último acceso</label>
                    <p className="text-gray-900">{formatDate(selectedUser.last_login)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleChangeRole(selectedUser.id, selectedUser.rol === 'admin' ? 'user' : 'admin')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {selectedUser.rol === 'admin' ? 'Hacer Usuario' : 'Hacer Admin'}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedUser.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedUser.status === 'active'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {selectedUser.status === 'active' ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}