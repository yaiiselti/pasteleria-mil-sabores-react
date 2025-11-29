const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

const getToken = () => localStorage.getItem('token');

const authHeader = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Mantenemos la interfaz igual para no romper nada
export interface IUsuario {
  run: string;
  nombre: string;
  apellidos: string;
  email: string;
  password?: string;
  tipo: 'Cliente' | 'Administrador';
  region?: string;
  comuna?: string;
  fechaNacimiento?: string;
  codigoPromo?: string;
  pin?: string;
}

// 1. OBTENER TODOS LOS USUARIOS (Desde Backend)
export const getUsuarios = async (): Promise<IUsuario[]> => {
  try {
    // Si tienes token (admin), úsalo. Si no (registro), intenta sin token o ajusta permisos en backend.
    // Asumimos que para registrarse necesitas validar duplicados, el backend debe permitirlo o el registro debe manejar el error.
    const res = await fetch(`${API_URL}/usuarios`, { method: 'GET', headers: authHeader() });
    return res.ok ? await res.json() : [];
  } catch { return []; }
};

// 2. OBTENER USUARIO POR RUN
export const getUsuarioByRun = async (run: string): Promise<IUsuario | null> => {
  try {
    const res = await fetch(`${API_URL}/usuarios/${run}`, { method: 'GET', headers: authHeader() });
    return res.ok ? await res.json() : null;
  } catch { return null; }
};

// 3. GUARDAR USUARIO (Registro y Edición) -> AQUÍ OCURRE LA MAGIA
export const saveUsuario = async (usuario: IUsuario): Promise<void> => {
  // Ajuste técnico: El backend espera 'tipo' como String, aquí lo mandamos.
  await fetch(`${API_URL}/auth/register`, { // Usamos el endpoint público de registro
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // No requiere token para registrarse
    body: JSON.stringify(usuario)
  });
};

// 4. ELIMINAR USUARIO
export const deleteUsuario = async (run: string): Promise<void> => {
  await fetch(`${API_URL}/usuarios/${run}`, {
    method: 'DELETE',
    headers: authHeader()
  });
};

// 5. CAMBIAR PIN
export const setUsuarioPin = async (run: string, newPin: string): Promise<void> => {
  const usuario = await getUsuarioByRun(run);
  if (usuario) {
    // Reenviamos el usuario actualizado al backend
    // Nota: Si usas /auth/register para actualizar, asegúrate que tu backend soporte update.
    // Idealmente deberías tener un endpoint PUT /usuarios/{run}
    // Por ahora, asumimos que el backend maneja el "save" como "update" si el ID existe.
    await fetch(`${API_URL}/usuarios`, { 
      method: 'POST', 
      headers: authHeader(), 
      body: JSON.stringify({ ...usuario, pin: newPin }) 
    });
  }
};