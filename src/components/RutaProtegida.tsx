import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  soloAdmin?: boolean;
}

const RutaProtegida = ({ soloAdmin = false }: Props) => {
  const { user, isAuthenticated } = useAuth();

  // 1. Si no ha iniciado sesión, lo mandamos al Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si la ruta es solo para Admin y el usuario NO lo es, lo mandamos al Home
  if (soloAdmin && user?.rol !== 'Administrador') {
    return <Navigate to="/" replace />;
  }

  // 3. Si cumple todo, lo dejamos pasar (Outlet muestra el contenido hijo)
  return <Outlet />;
};

export default RutaProtegida;