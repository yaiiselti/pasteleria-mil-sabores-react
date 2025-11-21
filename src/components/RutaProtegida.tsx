import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  soloAdmin?: boolean;
}

const RutaProtegida = ({ soloAdmin = false }: Props) => {
  const { user, isAuthenticated } = useAuth();

  // 1. Si no está logueado -> Al Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si requiere Admin y NO es Admin -> Al Home (o página de acceso denegado)
  if (soloAdmin && user?.rol !== 'Administrador') {
    return <Navigate to="/" replace />;
  }

  // 3. Si pasa las reglas -> Muestra el contenido
  return <Outlet />;
};

export default RutaProtegida;