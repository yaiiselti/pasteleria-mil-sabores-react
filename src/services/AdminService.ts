const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

const getToken = () => localStorage.getItem('token');

const authHeader = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// ACTUALIZADO: Agregamos direccion
export interface IUsuario {
  run: string;
  nombre: string;
  apellidos: string;
  email: string;
  password?: string;
  tipo: 'Cliente' | 'Administrador';
  region?: string;
  comuna?: string;
  direccion?: string; // <--- Nuevo campo
  fechaNacimiento?: string;
  codigoPromo?: string;
  pin?: string;
}

export const getUsuarios = async (): Promise<IUsuario[]> => {
  try {
    const res = await fetch(`${API_URL}/usuarios`, { method: 'GET', headers: authHeader() });
    return res.ok ? await res.json() : [];
  } catch { return []; }
};

export const getUsuarioByRun = async (run: string): Promise<IUsuario | null> => {
  try {
    const res = await fetch(`${API_URL}/usuarios/${run}`, { method: 'GET', headers: authHeader() });
    return res.ok ? await res.json() : null;
  } catch { return null; }
};

export const saveUsuario = async (usuario: IUsuario): Promise<void> => {
  const token = getToken();
  if (!token) {
      await fetch(`${API_URL}/auth/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      });
      return; 
  }
  await fetch(`${API_URL}/usuarios`, { 
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(usuario)
  });
};

export const deleteUsuario = async (run: string): Promise<void> => {
  await fetch(`${API_URL}/usuarios/${run}`, {
    method: 'DELETE',
    headers: authHeader()
  });
};

export const setUsuarioPin = async (run: string, newPin: string): Promise<void> => {
  const usuario = await getUsuarioByRun(run);
  if (usuario) {
    await saveUsuario({ ...usuario, pin: newPin });
  }
};