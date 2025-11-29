const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

const getToken = () => localStorage.getItem('token');

const authHeader = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Interfaces originales (NO TOCAR PARA NO ROMPER VISTAS)
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

export interface IPedido {
  id: number;
  fechaEmision: string;
  horaEmision: string;
  fechaEntrega: string;
  cliente: any; // any para evitar conflicto con Checkout.tsx
  subtotal?: number;
  descuento?: number;
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
    headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(pedido)
    });
    return res.ok ? await res.json() : null;
  } catch { return null; }
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
  const pedidos = await getAllPedidos();
  const pedidoActual = pedidos.find(p => p.id === idPedido);
  if (pedidoActual) {
    const pedidoModificado = { ...pedidoActual, productos: productosActualizados };
    await fetch(`${API_URL}/pedidos/${idPedido}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(pedidoModificado)
    });
  }
};