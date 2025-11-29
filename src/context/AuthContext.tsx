import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

interface UserSession {
  run: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: 'Cliente' | 'Administrador';
  token: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  fechaNacimiento?: string; // Necesario para calcular edad
  codigoPromo?: string;     // Necesario para cupón
}

interface LoginResponse {
  success: boolean;
  message: string;
  rol?: 'Cliente' | 'Administrador';
  run?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  registro: (datos: any) => Promise<boolean>;
  updateUserSession: (newData: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const storedUser = localStorage.getItem('usuarioSesion');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        return { ...JSON.parse(storedUser), token: storedToken };
      }
      return null;
    } catch { return null; }
  });

  // --- FUNCIÓN AUXILIAR: CALCULAR Y GUARDAR BENEFICIOS ---
  const activarBeneficios = (usuario: any) => {
    // 1. Descuento por Edad (50% si >= 50 años)
    if (usuario.fechaNacimiento) {
      const hoy = new Date();
      const cumple = new Date(usuario.fechaNacimiento);
      let edad = hoy.getFullYear() - cumple.getFullYear();
      const m = hoy.getMonth() - cumple.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
        edad--;
      }

      if (edad >= 50) {
        localStorage.setItem('descuentoEdad', 'true');
      } else {
        localStorage.removeItem('descuentoEdad');
      }
    }

    // 2. Descuento por Código
    if (usuario.codigoPromo && usuario.codigoPromo.trim().toUpperCase() === 'FELICES50') {
      localStorage.setItem('descuentoCodigo', 'true');
    } else {
      localStorage.removeItem('descuentoCodigo');
    }
  };

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const sessionData: UserSession = {
          token: data.token,
          run: data.run,
          nombre: data.nombre,
          apellidos: data.apellidos || '',
          email: data.email || email,
          rol: data.rol as 'Cliente' | 'Administrador',
          region: data.region || '',
          comuna: data.comuna || '',
          direccion: data.direccion || '',
          fechaNacimiento: data.fechaNacimiento, // Importante
          codigoPromo: data.codigoPromo          // Importante
        };

        // Guardamos sesión
        setUser(sessionData);
        localStorage.setItem('usuarioSesion', JSON.stringify(sessionData));
        localStorage.setItem('token', data.token);

        // --- ¡AQUÍ ESTÁ LA MAGIA! ---
        // Reactivamos los beneficios automáticamente
        activarBeneficios(data);

        return { 
          success: true, 
          message: `Bienvenido ${data.nombre}`,
          rol: data.rol,
          run: data.run 
        };
      } else {
        return { success: false, message: 'Credenciales incorrectas' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  };

  const registro = async (datos: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      // Nota: El registro original ya guardaba los beneficios en localStorage, 
      // así que no necesitamos hacerlo aquí, la vista lo maneja.
      return response.ok;
    } catch { return false; }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuarioSesion');
    localStorage.removeItem('token');
    // Limpiamos beneficios al salir para seguridad
    localStorage.removeItem('descuentoEdad');
    localStorage.removeItem('descuentoCodigo');
  };

  const updateUserSession = (newData: Partial<UserSession>) => {
    if (user) {
      const updated = { ...user, ...newData };
      setUser(updated);
      localStorage.setItem('usuarioSesion', JSON.stringify(updated));
      // Si actualizaron fecha o código, recalculamos beneficios
      activarBeneficios(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, registro, updateUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe estar dentro de AuthProvider');
  return context;
};