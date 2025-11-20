import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getUsuarios } from '../services/PasteleriaService';

// Definimos qué datos tendrá nuestro usuario en sesión
interface UserSession {
  email: string;
  nombre: string;
  rol: 'Cliente' | 'Administrador' | 'Vendedor';
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);

  // Al cargar, revisamos si ya había alguien logueado en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('usuarioSesion');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // 1. Obtenemos los usuarios "reales" del servicio
    const usuarios = await getUsuarios();
    
    // 2. Buscamos si el correo existe
    const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    // 3. Regla especial para el Admin
    if (email === 'admin@duoc.cl' && password === 'admin') {
       const adminUser: UserSession = { email, nombre: 'Administrador', rol: 'Administrador' };
       guardarSesion(adminUser);
       return { success: true, message: 'Bienvenido Admin' };
    }

    if (usuarioEncontrado) {
        // Login Exitoso
        const sessionData: UserSession = {
            email: usuarioEncontrado.email,
            nombre: usuarioEncontrado.nombre,
            rol: usuarioEncontrado.tipo
        };
        guardarSesion(sessionData);
        return { success: true, message: `Bienvenido ${usuarioEncontrado.nombre}` };
    }

    return { success: false, message: 'Credenciales incorrectas' };
  };

  const guardarSesion = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem('usuarioSesion', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuarioSesion');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};