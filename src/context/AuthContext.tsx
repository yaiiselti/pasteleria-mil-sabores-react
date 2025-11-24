import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getUsuarios } from '../services/PasteleriaService';

// 1. Interfaz de Sesión (Con datos reales)
interface UserSession {
  email: string;
  nombre: string;
  rol: 'Cliente' | 'Administrador';
  fechaNacimiento?: string;
  codigoPromo?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserSession: (newData: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const storedUser = localStorage.getItem('usuarioSesion');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  // --- CORRECCIÓN AQUÍ ---
  // Creamos la variable derivada para saber si está autenticado
  const isAuthenticated = !!user; 
  // -----------------------

  useEffect(() => {
    if (user) {
      localStorage.setItem('usuarioSesion', JSON.stringify(user));
    } else {
      localStorage.removeItem('usuarioSesion');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const usuarios = await getUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Admin Hardcoded
    if (email === 'admin@duoc.cl' && password === 'admin') {
       const adminUser: UserSession = { email, nombre: 'Administrador', rol: 'Administrador' };
       setUser(adminUser);
       return { success: true, message: 'Bienvenido Admin' };
    }

    if (usuarioEncontrado) {
        if (usuarioEncontrado.password === password) {
            
            const sessionData: UserSession = {
                email: usuarioEncontrado.email,
                nombre: usuarioEncontrado.nombre,
                rol: usuarioEncontrado.tipo,
                fechaNacimiento: usuarioEncontrado.fechaNacimiento,
                codigoPromo: usuarioEncontrado.codigoPromo
            };
            
            setUser(sessionData);
            return { success: true, message: `Bienvenido ${usuarioEncontrado.nombre}` };
        } else {
            return { success: false, message: 'Contraseña incorrecta' };
        }
    }
    return { success: false, message: 'Usuario no encontrado' };
  };

  const updateUserSession = (newData: Partial<UserSession>) => {
    if (user) {
      setUser({ ...user, ...newData });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, // ¡Ahora sí funciona porque la variable existe!
      login, 
      logout, 
      updateUserSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};