const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

const getToken = () => localStorage.getItem('token');

const authHeader = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Interfaces adaptadas al Backend
export interface IProducto {
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagenes: string[];
  activo: boolean; 
}

export interface IResena {
  id: number;
  codigoProducto: string;
  emailUsuario: string;
  nombreUsuario: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

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
  direccion?: string; // Hacemos opcional para compatibilidad
}

export interface IPedido {
  id: number; // El backend envía Long, aquí number está bien
  fechaEmision: string;
  horaEmision: string;
  fechaEntrega: string;
  cliente: any; 
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
  productos: any[];
}

// --- PRODUCTOS ---
export const getProductos = async (): Promise<IProducto[]> => {
  try {
    const res = await fetch(`${API_URL}/productos`); 
    return res.ok ? await res.json() : [];
  } catch { return []; }
};

export const getProductoByCodigo = async (codigo: string): Promise<IProducto> => {
  const res = await fetch(`${API_URL}/productos/${codigo}`);
  if (!res.ok) throw new Error('Producto no encontrado');
  return await res.json();
};

export const saveProducto = async (producto: IProducto): Promise<void> => {
  await fetch(`${API_URL}/productos`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(producto)
  });
};

export const deleteProducto = async (codigo: string): Promise<void> => {
  await fetch(`${API_URL}/productos/${codigo}`, {
    method: 'DELETE',
    headers: authHeader()
  });
};

export const toggleEstadoProducto = async (codigo: string): Promise<boolean> => {
  try {
    const producto = await getProductoByCodigo(codigo);
    const nuevoEstado = !producto.activo;
    await saveProducto({ ...producto, activo: nuevoEstado });
    return nuevoEstado;
  } catch { return false; }
};

export const getCategorias = async (): Promise<string[]> => {
  const productos = await getProductos();
  return [...new Set(productos.map(p => p.categoria))];
};

// --- RESEÑAS ---
export const getAllResenas = async (): Promise<IResena[]> => {
  try {
    const res = await fetch(`${API_URL}/resenas`, { headers: authHeader() });
    return res.ok ? await res.json() : [];
  } catch { return []; }
};

export const getResenasPorProducto = async (codigoProducto: string): Promise<IResena[]> => {
  try {
    const res = await fetch(`${API_URL}/resenas/producto/${codigoProducto}`);
    return res.ok ? await res.json() : [];
  } catch { return []; }
};

export const saveResena = async (nuevaResena: any): Promise<void> => {
  await fetch(`${API_URL}/resenas`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader() // Agregamos auth por seguridad si el backend lo pide
    },
    body: JSON.stringify(nuevaResena)
  });
};

export const deleteResena = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/resenas/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
};

// --- PEDIDOS ---
export const getAllPedidos = async (): Promise<IPedido[]> => {
  try {
    const res = await fetch(`${API_URL}/pedidos`, { headers: authHeader() });
    return res.ok ? await res.json() : [];
  } catch { return []; }
};

export const savePedido = async (pedido: any): Promise<IPedido | null> => {
  try {
    // IMPORTANTE: El pedido que viene del carrito tiene ID random.
    // Lo enviamos tal cual, el Backend debe ignorarlo y generar uno nuevo.
    const res = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: authHeader(), // Requiere token si el usuario está logueado
      body: JSON.stringify(pedido)
    });
    
    if (res.ok) {
      return await res.json();
    } else {
      console.error("Error backend:", await res.text());
      return null;
    }
  } catch (e) { 
    console.error(e);
    return null; 
  }
};

export const updateEstadoPedido = async (id: number, nuevoEstado: string): Promise<void> => {
  await fetch(`${API_URL}/pedidos/${id}/estado?nuevoEstado=${nuevoEstado}`, {
    method: 'PUT',
    headers: authHeader()
  });
};

export const deletePedido = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/pedidos/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
};

export const updatePedidoProductos = async (idPedido: number, productosActualizados: any[]): Promise<void> => {
  // ESTRATEGIA DIRECTA: No buscamos el pedido de nuevo. 
  // Construimos un objeto ligero con solo lo necesario para el backend.
  
  const payload = {
    id: idPedido,
    // Enviamos solo los productos, el backend se encarga de cruzar los datos
    productos: productosActualizados,
    // Mantenemos el estado actual para que no se pierda o cambie accidentalmente
    estado: 'Sin Cambios' // El backend ignorará esto si solo actualizamos productos, o podemos omitirlo
  };

  try {
    const res = await fetch(`${API_URL}/pedidos/${idPedido}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("Error al guardar en backend:", await res.text());
    }
  } catch (e) {
    console.error("Error de red:", e);
  }
};

export const toggleProductoListo = async (pedidoId: number, detalleId: number, listo: boolean): Promise<boolean> => {
  try {
    // Usamos el endpoint específico para no re-enviar todo el pedido pesado
    const res = await fetch(`${API_URL}/pedidos/${pedidoId}/productos/${detalleId}/listo?listo=${listo}`, {
      method: 'PUT',
      headers: authHeader()
    });
    return res.ok;
  } catch (error) {
    console.error("Error al marcar producto:", error);
    return false;
  }
};

// --- NUEVA FUNCIÓN: RASTREO PÚBLICO ---
export const trackPedido = async (id: number, email: string) => {
    const response = await fetch(`${API_URL}/pedidos/track?id=${id}&email=${email}`);
    if (!response.ok) {
        throw new Error('Pedido no encontrado');
    }
    return await response.json();
};