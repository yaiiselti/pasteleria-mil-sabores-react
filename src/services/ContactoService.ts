// URL BASE DEL BACKEND
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

// --- HERRAMIENTAS AUXILIARES ---
const getToken = () => localStorage.getItem('token');

// Función segura para headers (Igual que en los otros servicios)
const authHeader = (): Record<string, string> => {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// --- INTERFAZ ---
export interface IMensajeContacto {
  id: number;
  nombre: string;
  email: string;
  comentario: string;
  fecha: string;
  leido: boolean;
}

// ==========================================
// FUNCIONES CONECTADAS (Usando las variables)
// ==========================================

export const getAllMensajes = async (): Promise<IMensajeContacto[]> => {
  try {
    // Aquí usamos API_URL y authHeader
    const res = await fetch(`${API_URL}/mensajes`, { 
      method: 'GET',
      headers: authHeader() 
    });
    return res.ok ? await res.json() : [];
  } catch (error) {
    console.error("Error cargando mensajes", error);
    return [];
  }
};

export const saveMensaje = async (mensaje: any): Promise<boolean> => {
  try {
    // Usamos API_URL
    const res = await fetch(`${API_URL}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Público, no requiere token
      body: JSON.stringify(mensaje)
    });
    return res.ok;
  } catch (error) {
    console.error("Error enviando mensaje", error);
    return false;
  }
};

export const markAsRead = async (id: number): Promise<boolean> => {
  try {
    // Usamos API_URL y authHeader
    const res = await fetch(`${API_URL}/mensajes/${id}/leido`, {
      method: 'PUT',
      headers: authHeader()
    });
    return res.ok;
  } catch (error) {
    return false;
  }
};

export const deleteMensaje = async (id: number): Promise<boolean> => {
  try {
    // Usamos API_URL y authHeader
    const res = await fetch(`${API_URL}/mensajes/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    return res.ok;
  } catch (error) {
    return false;
  }
};