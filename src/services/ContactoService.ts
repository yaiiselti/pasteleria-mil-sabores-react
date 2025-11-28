// src/services/ContactoService.ts

export interface IMensajeContacto {
  id: number;
  nombre: string;
  email: string;
  comentario: string;
  fecha: string;
  leido: boolean; // Para saber si es nuevo o no
}

const KEY_MENSAJES_DB = 'mensajesContacto';

// --- LÓGICA INTERNA (Helpers) ---

const cargarMensajesBD = (): IMensajeContacto[] => {
  try {
    const guardado = localStorage.getItem(KEY_MENSAJES_DB);
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
};

const guardarMensajesBD = (datos: IMensajeContacto[]) => {
  localStorage.setItem(KEY_MENSAJES_DB, JSON.stringify(datos));
};

// --- FUNCIONES PÚBLICAS (API) ---

// 1. Guardar un nuevo mensaje (Usado por el Cliente)
export const saveMensaje = async (datos: { nombre: string; email: string; comentario: string }): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simular red
  
  const mensajes = cargarMensajesBD();
  
  const nuevoMensaje: IMensajeContacto = {
    id: Date.now(),
    fecha: new Date().toLocaleString(), // Fecha y hora actual
    leido: false, // Por defecto no leído
    ...datos
  };

  mensajes.push(nuevoMensaje);
  guardarMensajesBD(mensajes);
};

// 2. Obtener todos los mensajes (Usado por el Admin)
export const getAllMensajes = async (): Promise<IMensajeContacto[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return cargarMensajesBD();
};

// 3. Marcar mensaje como leído
export const markAsRead = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const mensajes = cargarMensajesBD();
  
  const index = mensajes.findIndex(m => m.id === id);
  if (index >= 0) {
    mensajes[index].leido = true;
    guardarMensajesBD(mensajes);
  }
};

// 4. Eliminar mensaje
export const deleteMensaje = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let mensajes = cargarMensajesBD();
  mensajes = mensajes.filter(m => m.id !== id);
  guardarMensajesBD(mensajes);
};

// 5. Obtener conteo de NO leídos (Para el Dashboard/Badge)
export const getMensajesNoLeidosCount = async (): Promise<number> => {
    const mensajes = cargarMensajesBD(); // Síncrono para ser rápido, o async si prefieres
    return mensajes.filter(m => !m.leido).length;
};