import { createContext, useState, useContext, useEffect } from 'react'; // <--- IMPORTANTE: useEffect
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
    
    // Forzamos redirección visual por si acaso
    window.location.href = '/login';
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

  // --- NUEVO: MONITOR DE SESIÓN (Anti-Zombie) ---
  useEffect(() => {
    const verificarSesion = async () => {
      if (!user) return;

      try {
        // Intentamos consultar algo que requiera auth (como los datos del propio usuario)
        // Si el usuario fue borrado, esto fallará con 404 o 401
        const res = await fetch(`${API_URL}/usuarios/${user.run}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.status === 401 || res.status === 403 || res.status === 404) {
            console.warn("⚠️ Sesión invalidada. Cerrando...");
            logout();
        }
      } catch (error) {
        console.error("Error verificando sesión", error);
      }
    };

    // Verificamos al cargar y al volver a la pestaña
    window.addEventListener('focus', verificarSesion);
    verificarSesion(); // Check inicial

    return () => {
      window.removeEventListener('focus', verificarSesion);
    };
  }, [user]); // Dependencia: usuario actual

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