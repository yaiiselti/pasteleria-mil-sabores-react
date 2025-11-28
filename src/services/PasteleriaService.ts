// 1. DEFINIMOS Y EXPORTAMOS LA INTERFAZ ACTUALIZADA
export interface IProducto {
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagenes: string[];
  activo: boolean; // <--- NUEVO CAMPO
}

// 2. Datos iniciales con activo: true
const datosIniciales: IProducto[] = [
  {
    codigo: "TC001",
    nombre: "Torta Cuadrada de Chocolate",
    categoria: "Tortas Cuadradas",
    precio: 45000,
    descripcion: "Deliciosa torta de chocolate con capas de ganache y un toque de avellanas.",
    imagenes: [
      "../assets/img/productos/torta-chocolate-1.png",
      "../assets/img/productos/torta-chocolate-2.png",
      "../assets/img/productos/torta-chocolate-3.png",
      "../assets/img/productos/torta-chocolate-1.png"
    ],
    activo: true
  },
  {
    codigo: "TC002",
    nombre: "Torta Cuadrada de Frutas",
    categoria: "Tortas Cuadradas",
    precio: 50000,
    descripcion: "Una mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla.",
    imagenes: [
      "../assets/img/productos/torta-frutas-1.png",
      "../assets/img/productos/torta-frutas-2.png",
      "../assets/img/productos/torta-frutas-3.png",
      "../assets/img/productos/torta-frutas-1.png"
    ],
    activo: true
  },
  {
    codigo: "TT001",
    nombre: "Torta Circular de Vainilla",
    categoria: "Tortas Circulares",
    precio: 40000,
    descripcion: "Bizcocho de vainilla clásico relleno con crema pastelera y cubierto con un glaseado dulce.",
    imagenes: [
      "../assets/img/productos/torta-vainilla-1.png",
      "../assets/img/productos/torta-vainilla-2.png",
      "../assets/img/productos/torta-vainilla-3.png",
      "../assets/img/productos/torta-vainilla-1.png"
    ],
    activo: true
  },
  {
    codigo: "TT002",
    nombre: "Torta Circular de Manjar",
    categoria: "Tortas Circulares",
    precio: 42000,
    descripcion: "Torta tradicional chilena con manjar y nueces.",
    imagenes: [
      "../assets/img/productos/torta-manjar-1.png",
      "../assets/img/productos/torta-manjar-2.png",
      "../assets/img/productos/torta-manjar-3.png",
      "../assets/img/productos/torta-manjar-1.png"
    ],
    activo: true
  },
  {
    codigo: "PI001",
    nombre: "Mousse de Chocolate",
    categoria: "Postres Individuales",
    precio: 5000,
    descripcion: "Postre individual cremoso y suave, hecho con chocolate de alta calidad.",
    imagenes: [
      "../assets/img/productos/mousse-chocolate-1.png",
      "../assets/img/productos/mousse-chocolate-2.png",
      "../assets/img/productos/mousse-chocolate-3.png",
      "../assets/img/productos/mousse-chocolate-1.png"
    ],
    activo: true
  },
  {
    codigo: "PI002",
    nombre: "Tiramisú Clásico",
    categoria: "Postres Individuales",
    precio: 5500,
    descripcion: "Un postre italiano individual con capas de café, mascarpone y cacao.",
    imagenes: [
      "../assets/img/productos/tiramisu-1.png",
      "../assets/img/productos/tiramisu-2.png",
      "../assets/img/productos/tiramisu-3.png",
      "../assets/img/productos/tiramisu-1.png"
    ],
    activo: true
  },
  {
    codigo: "PSA001",
    nombre: "Torta Sin Azúcar de Naranja",
    categoria: "Productos Sin Azúcar",
    precio: 48000,
    descripcion: "Torta ligera y deliciosa, endulzada naturalmente.",
    imagenes: [
      "../assets/img/productos/torta-naranja-1.png",
      "../assets/img/productos/torta-naranja-2.png",
      "../assets/img/productos/torta-naranja-3.png",
      "../assets/img/productos/torta-naranja-1.png"
    ],
    activo: true
  },
  {
    codigo: "PSA002",
    nombre: "Cheesecake Sin Azúcar",
    categoria: "Productos Sin Azúcar",
    precio: 47000,
    descripcion: "Suave y cremoso, este cheesecake es una opción perfecta para disfrutar sin culpa.",
    imagenes: [
      "../assets/img/productos/cheesecake-1.png",
      "../assets/img/productos/cheesecake-2.png",
      "../assets/img/productos/cheesecake-3.png",
      "../assets/img/productos/cheesecake-1.png"
    ],
    activo: true
  },
  {
    codigo: "PT001",
    nombre: "Empanada de Manzana",
    categoria: "Pastelería Tradicional",
    precio: 3000,
    descripcion: "Pastelería tradicional rellena de manzanas especiadas.",
    imagenes: [
      "../assets/img/productos/empanada-manzana-1.png",
      "../assets/img/productos/empanada-manzana-2.png",
      "../assets/img/productos/empanada-manzana-3.png",
      "../assets/img/productos/empanada-manzana-1.png"
    ],
    activo: true
  },
  {
    codigo: "PT002",
    nombre: "Tarta de Santiago",
    categoria: "Pastelería Tradicional",
    precio: 6000,
    descripcion: "Tradicional tarta española hecha con almendras, azúcar, y huevos.",
    imagenes: [
      "../assets/img/productos/tarta-santiago-1.png",
      "../assets/img/productos/tarta-santiago-2.png",
      "../assets/img/productos/tarta-santiago-3.png",
      "../assets/img/productos/tarta-santiago-1.png"
    ],
    activo: true
  },
  {
    codigo: "PG001",
    nombre: "Brownie Sin Gluten",
    categoria: "Productos Sin Gluten",
    precio: 4000,
    descripcion: "Rico y denso, este brownie es perfecto para quienes necesitan evitar el gluten.",
    imagenes: [
      "../assets/img/productos/brownie-sg-1.png",
      "../assets/img/productos/brownie-sg-2.png",
      "../assets/img/productos/brownie-sg-3.png",
      "../assets/img/productos/brownie-sg-1.png"
    ],
    activo: true
  },
  {
    codigo: "PG002",
    nombre: "Pan Sin Gluten",
    categoria: "Productos Sin Gluten",
    precio: 3500,
    descripcion: "Suave y esponjoso, ideal para sandwiches.",
    imagenes: [
      "../assets/img/productos/pan-sg-1.png",
      "../assets/img/productos/pan-sg-2.png",
      "../assets/img/productos/pan-sg-3.png",
      "../assets/img/productos/pan-sg-1.png"
    ],
    activo: true
  },
  {
    codigo: "PV001",
    nombre: "Torta Vegana de Chocolate",
    categoria: "Productos Vegana",
    precio: 50000,
    descripcion: "Torta de chocolate húmeda y deliciosa, hecha sin productos de origen animal.",
    imagenes: [
      "../assets/img/productos/torta-vegana-1.png",
      "../assets/img/productos/torta-vegana-2.png",
      "../assets/img/productos/torta-vegana-3.png",
      "../assets/img/productos/torta-vegana-1.png"
    ],
    activo: true
  },
  {
    codigo: "PV002",
    nombre: "Galletas Veganas de Avena",
    categoria: "Productos Vegana",
    precio: 4500,
    descripcion: "Crujientes y sabrosas, estas galletas son una excelente opción para un snack saludable.",
    imagenes: [
      "../assets/img/productos/galletas-veganas-1.png",
      "../assets/img/productos/galletas-veganas-2.png",
      "../assets/img/productos/galletas-veganas-3.png",
      "../assets/img/productos/galletas-veganas-1.png"
    ],
    activo: true
  },
  {
    codigo: "TE001",
    nombre: "Torta Especial de Cumpleaños",
    categoria: "Tortas Especiales",
    precio: 55000,
    descripcion: "Diseñada especialmente para celebraciones, personalizable con decoraciones.",
    imagenes: [
      "../assets/img/productos/torta-cumpleaños-1.png",
      "../assets/img/productos/torta-cumpleaños-2.png",
      "../assets/img/productos/torta-cumpleaños-3.png",
      "../assets/img/productos/torta-cumpleaños-1.png"
    ],
    activo: true
  },
  {
    codigo: "TE002",
    nombre: "Torta Especial de Boda",
    categoria: "Tortas Especiales",
    precio: 60000,
    descripcion: "Elegante y deliciosa, diseñada para ser el centro de atención en cualquier boda.",
    imagenes: [
      "../assets/img/productos/torta-boda-1.png",
      "../assets/img/productos/torta-boda-2.png",
      "../assets/img/productos/torta-boda-3.png",
      "../assets/img/productos/torta-boda-1.png"
    ],
    activo: true
  }
];

// --- LÓGICA DE PERSISTENCIA ---

const KEY_DB = 'productosDB';

const cargarBD = (): IProducto[] => {
  try {
    const guardado = localStorage.getItem(KEY_DB);
    if (guardado) {
      return JSON.parse(guardado);
    }
    localStorage.setItem(KEY_DB, JSON.stringify(datosIniciales));
    return datosIniciales;
  } catch (e) {
    return datosIniciales;
  }
};

const guardarBD = (datos: IProducto[]) => {
  localStorage.setItem(KEY_DB, JSON.stringify(datos));
};


// --- FUNCIONES CRUD ---

export const getProductos = async (): Promise<IProducto[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return cargarBD();
};

export const getProductoByCodigo = async (codigo: string): Promise<IProducto> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const productos = cargarBD();
  const producto = productos.find(p => p.codigo === codigo);
  if (!producto) throw new Error('Producto no encontrado');
  return producto;
};

export const getCategorias = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const productos = cargarBD();
  // Solo categorías de productos activos para la tienda, pero aquí devolvemos todas
  return [...new Set(productos.map(p => p.categoria))];
};

export const deleteProducto = async (codigo: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let productos = cargarBD();
  productos = productos.filter(p => p.codigo !== codigo);
  guardarBD(productos);
};

export const saveProducto = async (producto: IProducto): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let productos = cargarBD();

  const index = productos.findIndex(p => p.codigo === producto.codigo);

  if (index >= 0) {
    productos[index] = producto;
  } else {
    // Al crear uno nuevo, por defecto activo
    if (producto.activo === undefined) producto.activo = true;
    productos.push(producto);
  }

  guardarBD(productos);
};

// --- NUEVA FUNCIÓN: CAMBIAR ESTADO (ACTIVAR/DESACTIVAR) ---
export const toggleEstadoProducto = async (codigo: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 300));
    const productos = cargarBD();
    const index = productos.findIndex(p => p.codigo === codigo);
    
    if (index >= 0) {
        // Invertimos el estado
        productos[index].activo = !productos[index].activo;
        guardarBD(productos);
        return productos[index].activo; // Devolvemos el nuevo estado
    }
    throw new Error("Producto no encontrado");
};

// --------------------------------------------------------------------------
// RESEÑAS (Se mantiene igual)
// --------------------------------------------------------------------------
export interface IResena {
  id: number;
  codigoProducto: string;
  emailUsuario: string;
  nombreUsuario: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

const resenasIniciales: IResena[] = [
  {
    id: 1,
    codigoProducto: "TC001",
    emailUsuario: "ana.gonzalez@duoc.cl",
    nombreUsuario: "Ana González",
    calificacion: 5,
    comentario: "¡Exquisita! La mejor torta que he probado.",
    fecha: "10/05/2024"
  },
  {
    id: 2,
    codigoProducto: "TC001",
    emailUsuario: "carlos.perez@gmail.com",
    nombreUsuario: "Carlos",
    calificacion: 4,
    comentario: "Estaba rica, pero el envío demoró un poco.",
    fecha: "2024-05-12"
  }
];

const KEY_RESENAS = 'resenasDB';

const cargarResenasBD = (): IResena[] => {
  try {
    const guardado = localStorage.getItem(KEY_RESENAS);
    return guardado ? JSON.parse(guardado) : resenasIniciales;
  } catch { return resenasIniciales; }
};

const guardarResenasBD = (datos: IResena[]) => {
  localStorage.setItem(KEY_RESENAS, JSON.stringify(datos));
};

export const getAllResenas = async (): Promise<IResena[]> => {
  await new Promise(r => setTimeout(r, 300));
  return cargarResenasBD();
};

export const getResenasPorProducto = async (codigoProducto: string): Promise<IResena[]> => {
  await new Promise(r => setTimeout(r, 300));
  const todas = cargarResenasBD();
  return todas.filter(r => r.codigoProducto === codigoProducto);
};

export const saveResena = async (nuevaResena: Omit<IResena, 'id'>): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  let lista = cargarResenasBD();
  const resenaConId: IResena = { ...nuevaResena, id: Date.now() };
  lista.push(resenaConId);
  guardarResenasBD(lista);
};

export const deleteResena = async (id: number): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  let lista = cargarResenasBD();
  guardarResenasBD(lista.filter(r => r.id !== id));
};


// --------------------------------------------------------------------------
// PEDIDOS (Se mantiene igual)
// --------------------------------------------------------------------------
export interface IPedido {
  id: number;
  fechaEmision: string;
  horaEmision: string;
  fechaEntrega: string;
  cliente: {
    nombre: string;
    email: string;
    direccion: string;
    comuna: string;
    medioPago: string;
  };
  total: number;
  estado: 'Pendiente' | 'En Preparación' | 'En Reparto' | 'Entregado' | 'Cancelado';
  productos: any[];
}

const KEY_PEDIDOS = 'historialPedidos';

const cargarPedidosBD = (): IPedido[] => {
  try {
    const guardado = localStorage.getItem(KEY_PEDIDOS);
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
};

const guardarPedidosBD = (datos: IPedido[]) => {
  localStorage.setItem(KEY_PEDIDOS, JSON.stringify(datos));
};

export const getAllPedidos = async (): Promise<IPedido[]> => {
  await new Promise(r => setTimeout(r, 300));
  return cargarPedidosBD();
};

export const updateEstadoPedido = async (id: number, nuevoEstado: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  const lista = cargarPedidosBD();
  const listaActualizada = lista.map(p => 
    p.id === id ? { ...p, estado: nuevoEstado } : p
  );
  // @ts-ignore
  guardarPedidosBD(listaActualizada);
};

export const deletePedido = async (id: number): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  const lista = cargarPedidosBD();
  const listaActualizada = lista.filter(p => p.id !== id);
  guardarPedidosBD(listaActualizada);
};