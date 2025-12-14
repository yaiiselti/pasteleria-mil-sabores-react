import { createContext, useState, useContext, useEffect } from 'react';
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
  fechaNacimiento?: string;
  codigoPromo?: string;
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

  const activarBeneficios = (usuario: any) => {
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
          fechaNacimiento: data.fechaNacimiento,
          codigoPromo: data.codigoPromo
        };

        setUser(sessionData);
        localStorage.setItem('usuarioSesion', JSON.stringify(sessionData));
        localStorage.setItem('token', data.token);
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
      return response.ok;
    } catch { return false; }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuarioSesion');
    localStorage.removeItem('token');
    localStorage.removeItem('descuentoEdad');
    localStorage.removeItem('descuentoCodigo');
    window.location.href = '/login';
  };

  const updateUserSession = (newData: Partial<UserSession>) => {
    if (user) {
      const updated = { ...user, ...newData };
      setUser(updated);
      localStorage.setItem('usuarioSesion', JSON.stringify(updated));
      activarBeneficios(updated);
    }
  };

  // --- 1. SINCRONIZADOR DE IDENTIDAD (Anti-Conflicto) ---
  // Detecta cambios en el token desde otras pestañas.
  useEffect(() => {
    const syncSession = (event: StorageEvent) => {
      if (event.key === 'token') {
        // Logout en otra pestaña
        if (event.newValue === null) {
            setUser(null);
            window.location.href = '/login';
        } 
        // Cambio de usuario en otra pestaña
        else if (event.newValue !== event.oldValue) {
            window.location.reload();
        }
      }
    };
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  // --- 2. MONITOR DE SESIÓN (Anti-Zombie) ---
  // Verifica si el usuario sigue existiendo en la BD al enfocar la ventana.
  useEffect(() => {
    const verificarSesion = async () => {
      // 1. SEGURIDAD EXTRA: Si user o user.run son null/undefined, no hacemos nada.
      // Esto evita que el código explote si el login aún no termina de cargar.
      if (!user || !user.run) return;

      try {
    // ELIMINA LA LÍNEA DEL REPLACE. Úsalo directo:
    const res = await fetch(`${API_URL}/usuarios/${user.run}`, { 
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

        // /// CAMBIO IMPORTANTE: COMENTA EL LOGOUT TEMPORALMENTE
        // Si hay error, solo avísanos en consola, no cierres la sesión todavía.
        if (!res.ok) {
            console.warn(`⚠️ La verificación falló con estado: ${res.status}`);
              if (res.status === 401 || res.status === 404) {
              logout();
                }
        } else {
            console.log("✅ Sesión verificada correctamente");
        }

      } catch (error) {
        console.error("Error verificando sesión", error);
      }
    };

    window.addEventListener('focus', verificarSesion);
    // Agregamos un pequeño delay al inicio para asegurar que el token se guardó bien
    const timer = setTimeout(() => verificarSesion(), 500);

    return () => {
      window.removeEventListener('focus', verificarSesion);
      clearTimeout(timer);
    };
  }, [user]);

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