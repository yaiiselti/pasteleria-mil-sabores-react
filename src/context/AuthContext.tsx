import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getUsuarios } from '../services/AdminService';

interface UserSession {
  run: string;
  email: string;
  nombre: string;
  apellidos?: string;
  rol: 'Cliente' | 'Administrador';
  region?: string;
  comuna?: string;
  fechaNacimiento?: string;
  codigoPromo?: string;
}

// 1. ACTUALIZAMOS LA INTERFAZ DE RESPUESTA
interface LoginResponse {
  success: boolean;
  message: string;
  rol?: 'Cliente' | 'Administrador';
  run?: string; // <--- AGREGAMOS ESTO
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
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

  const isAuthenticated = !!user; 

  useEffect(() => {
    if (user) {
      localStorage.setItem('usuarioSesion', JSON.stringify(user));
    } else {
      localStorage.removeItem('usuarioSesion');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const usuarios = await getUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (usuarioEncontrado) {
        if (usuarioEncontrado.password === password) {
            
            const sessionData: UserSession = {
                run: usuarioEncontrado.run,
                email: usuarioEncontrado.email,
                nombre: usuarioEncontrado.nombre,
                apellidos: usuarioEncontrado.apellidos,
                rol: usuarioEncontrado.tipo,
                region: usuarioEncontrado.region,
                comuna: usuarioEncontrado.comuna,
                fechaNacimiento: usuarioEncontrado.fechaNacimiento,
                codigoPromo: usuarioEncontrado.codigoPromo
            };
            
            setUser(sessionData);
            
            // 2. DEVOLVEMOS EL RUN AQUÍ DIRECTAMENTE
            return { 
              success: true, 
              message: `Bienvenido ${usuarioEncontrado.nombre}`,
              rol: usuarioEncontrado.tipo,
              run: usuarioEncontrado.run // <--- ¡AQUÍ ESTÁ LA CLAVE!
            };
        } else {
            return { success: false, message: 'Contraseña incorrecta' };
        }
    }
    return { success: false, message: 'Usuario no encontrado' };
  };

  const updateUserSession = (newData: Partial<UserSession>) => {
    if (user) setUser({ ...user, ...newData });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};