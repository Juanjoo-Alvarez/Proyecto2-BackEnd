import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Si se requiere admin y el usuario no es admin
  if (adminOnly && user.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default ProtectedRoute;