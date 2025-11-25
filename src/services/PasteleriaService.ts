// 1. DEFINIMOS Y EXPORTAMOS LA INTERFAZ
export interface IProducto {
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagenes: string[];
}

// 2. Le decimos a TypeScript que nuestro arreglo USA esa interfaz
const datosIniciales: IProducto[] = [
  {
    codigo: "TC001",
    nombre: "Torta Cuadrada de Chocolate",
    categoria: "Tortas Cuadradas",
    precio: 45000,
    descripcion: "Deliciosa torta de chocolate con capas de ganache y un toque de avellanas. Personalizable con mensajes especiales.",
    imagenes: [
      "../assets/img/productos/torta-chocolate-1.png",
      "../assets/img/productos/torta-chocolate-2.png",
      "../assets/img/productos/torta-chocolate-3.png",
      "../assets/img/productos/torta-chocolate-1.png"
    ]
  },
  {
    codigo: "TC002",
    nombre: "Torta Cuadrada de Frutas",
    categoria: "Tortas Cuadradas",
    precio: 50000,
    descripcion: "Una mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla, ideal para celebraciones.",
    imagenes: [
      "../assets/img/productos/torta-frutas-1.png",
      "../assets/img/productos/torta-frutas-2.png",
      "../assets/img/productos/torta-frutas-3.png",
      "../assets/img/productos/torta-frutas-1.png"
    ]
  },
  {
    codigo: "TT001",
    nombre: "Torta Circular de Vainilla",
    categoria: "Tortas Circulares",
    precio: 40000,
    descripcion: "Bizcocho de vainilla clásico relleno con crema pastelera y cubierto con un glaseado dulce, perfecto para cualquier ocasión.",
    imagenes: [
      "../assets/img/productos/torta-vainilla-1.png",
      "../assets/img/productos/torta-vainilla-2.png",
      "../assets/img/productos/torta-vainilla-3.png",
      "../assets/img/productos/torta-vainilla-1.png"
    ]
  },
  {
    codigo: "TT002",
    nombre: "Torta Circular de Manjar",
    categoria: "Tortas Circulares",
    precio: 42000,
    descripcion: "Torta tradicional chilena con manjar y nueces, un deleite para los amantes de los sabores dulces y clásicos.",
    imagenes: [
      "../assets/img/productos/torta-manjar-1.png",
      "../assets/img/productos/torta-manjar-2.png",
      "../assets/img/productos/torta-manjar-3.png",
      "../assets/img/productos/torta-manjar-1.png"
    ]
  },
  {
    codigo: "PI001",
    nombre: "Mousse de Chocolate",
    categoria: "Postres Individuales",
    precio: 5000,
    descripcion: "Postre individual cremoso y suave, hecho con chocolate de alta calidad, ideal para los amantes del chocolate.",
    imagenes: [
      "../assets/img/productos/mousse-chocolate-1.png",
      "../assets/img/productos/mousse-chocolate-2.png",
      "../assets/img/productos/mousse-chocolate-3.png",
      "../assets/img/productos/mousse-chocolate-1.png"
    ]
  },
  {
    codigo: "PI002",
    nombre: "Tiramisú Clásico",
    categoria: "Postres Individuales",
    precio: 5500,
    descripcion: "Un postre italiano individual con capas de café, mascarpone y cacao, perfecto para finalizar cualquier comida.",
    imagenes: [
      "../assets/img/productos/tiramisu-1.png",
      "../assets/img/productos/tiramisu-2.png",
      "../assets/img/productos/tiramisu-3.png",
      "../assets/img/productos/tiramisu-1.png"
    ]
  },
  {
    codigo: "PSA001",
    nombre: "Torta Sin Azúcar de Naranja",
    categoria: "Productos Sin Azúcar",
    precio: 48000,
    descripcion: "Torta ligera y deliciosa, endulzada naturalmente, ideal para quienes buscan opciones más saludables.",
    imagenes: [
      "../assets/img/productos/torta-naranja-1.png",
      "../assets/img/productos/torta-naranja-2.png",
      "../assets/img/productos/torta-naranja-3.png",
      "../assets/img/productos/torta-naranja-1.png"
    ]
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
    ]
  },
  {
    codigo: "PT001",
    nombre: "Empanada de Manzana",
    categoria: "Pastelería Tradicional",
    precio: 3000,
    descripcion: "Pastelería tradicional rellena de manzanas especiadas, perfecta para un dulce desayuno o merienda.",
    imagenes: [
      "../assets/img/productos/empanada-manzana-1.png",
      "../assets/img/productos/empanada-manzana-2.png",
      "../assets/img/productos/empanada-manzana-3.png",
      "../assets/img/productos/empanada-manzana-1.png"
    ]
  },
  {
    codigo: "PT002",
    nombre: "Tarta de Santiago",
    categoria: "Pastelería Tradicional",
    precio: 6000,
    descripcion: "Tradicional tarta española hecha con almendras, azúcar, y huevos, una delicia para los amantes de los postres clásicos.",
    imagenes: [
      "../assets/img/productos/tarta-santiago-1.png",
      "../assets/img/productos/tarta-santiago-2.png",
      "../assets/img/productos/tarta-santiago-3.png",
      "../assets/img/productos/tarta-santiago-1.png"
    ]
  },
  {
    codigo: "PG001",
    nombre: "Brownie Sin Gluten",
    categoria: "Productos Sin Gluten",
    precio: 4000,
    descripcion: "Rico y denso, este brownie es perfecto para quienes necesitan evitar el gluten sin sacrificar el sabor.",
    imagenes: [
      "../assets/img/productos/brownie-sg-1.png",
      "../assets/img/productos/brownie-sg-2.png",
      "../assets/img/productos/brownie-sg-3.png",
      "../assets/img/productos/brownie-sg-1.png"
    ]
  },
  {
    codigo: "PG002",
    nombre: "Pan Sin Gluten",
    categoria: "Productos Sin Gluten",
    precio: 3500,
    descripcion: "Suave y esponjoso, ideal para sandwiches o para acompañar cualquier comida.",
    imagenes: [
      "../assets/img/productos/pan-sg-1.png",
      "../assets/img/productos/pan-sg-2.png",
      "../assets/img/productos/pan-sg-3.png",
      "../assets/img/productos/pan-sg-1.png"
    ]
  },
  {
    codigo: "PV001",
    nombre: "Torta Vegana de Chocolate",
    categoria: "Productos Vegana",
    precio: 50000,
    descripcion: "Torta de chocolate húmeda y deliciosa, hecha sin productos de origen animal, perfecta para veganos.",
    imagenes: [
      "../assets/img/productos/torta-vegana-1.png",
      "../assets/img/productos/torta-vegana-2.png",
      "../assets/img/productos/torta-vegana-3.png",
      "../assets/img/productos/torta-vegana-1.png"
    ]
  },
  {
    codigo: "PV002",
    nombre: "Galletas Veganas de Avena",
    categoria: "Productos Vegana",
    precio: 4500,
    descripcion: "Crujientes y sabrosas, estas galletas son una excelente opción para un snack saludable y vegano.",
    imagenes: [
      "../assets/img/productos/galletas-veganas-1.png",
      "../assets/img/productos/galletas-veganas-2.png",
      "../assets/img/productos/galletas-veganas-3.png",
      "../assets/img/productos/galletas-veganas-1.png"
    ]
  },
  {
    codigo: "TE001",
    nombre: "Torta Especial de Cumpleaños",
    categoria: "Tortas Especiales",
    precio: 55000,
    descripcion: "Diseñada especialmente para celebraciones, personalizable con decoraciones y mensajes únicos.",
    imagenes: [
      "../assets/img/productos/torta-cumpleaños-1.png",
      "../assets/img/productos/torta-cumpleaños-2.png",
      "../assets/img/productos/torta-cumpleaños-3.png",
      "../assets/img/productos/torta-cumpleaños-1.png"
    ]
  },
  {
    codigo: "TE002",
    nombre: "Torta Especial de Boda",
    categoria: "Tortas Especiales",
    precio: 60000,
    descripcion: "Elegante y deliciosa, esta torta está diseñada para ser el centro de atención en cualquier boda.",
    imagenes: [
      "../assets/img/productos/torta-boda-1.png",
      "../assets/img/productos/torta-boda-2.png",
      "../assets/img/productos/torta-boda-3.png",
      "../assets/img/productos/torta-boda-1.png"
    ]
  }
];
// --- 3. LÓGICA DE PERSISTENCIA (El "Motor" del Admin) ---

const KEY_DB = 'productosDB';

const cargarBD = (): IProducto[] => {
  try {
    const guardado = localStorage.getItem(KEY_DB);
    if (guardado) {
      return JSON.parse(guardado);
    }
    // Si no hay nada, guardamos los iniciales
    localStorage.setItem(KEY_DB, JSON.stringify(datosIniciales));
    return datosIniciales;
  } catch (e) {
    return datosIniciales;
  }
};

const guardarBD = (datos: IProducto[]) => {
  localStorage.setItem(KEY_DB, JSON.stringify(datos));
};


// --- 4. FUNCIONES CRUD (Lo que usará el Admin) ---

export const getProductos = async (): Promise<IProducto[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simular red
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
  return [...new Set(productos.map(p => p.categoria))];
};

// ¡NUEVO! Eliminar producto
export const deleteProducto = async (codigo: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let productos = cargarBD();
  // Filtramos para quitar el producto con ese código
  productos = productos.filter(p => p.codigo !== codigo);
  guardarBD(productos);
};

// ¡NUEVO! Guardar (Crear o Editar)
export const saveProducto = async (producto: IProducto): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let productos = cargarBD();

  const index = productos.findIndex(p => p.codigo === producto.codigo);

  if (index >= 0) {
    // Si ya existe, lo actualizamos (Editar)
    productos[index] = producto;
  } else {
    // Si no existe, lo agregamos al final (Crear nuevo)
    productos.push(producto);
  }

  guardarBD(productos);
};










// ----------------------------------------------------------- datos con usuarios ---------------------------------------------------


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
}


const usuariosIniciales: IUsuario[] = [
  {
    run: "12345678-K",
    nombre: "Ana",
    apellidos: "González",
    email: "ana.gonzalez@duoc.cl",
    password: "1234",
    tipo: "Cliente",
    region: "Metropolitana",
    comuna: "Santiago",
    fechaNacimiento: "1960-05-10"
  },
  {
    run: "98765432-1",
    nombre: "Carlos",
    apellidos: "Pérez",
    email: "carlos.perez@gmail.com",
    password: "1234",
    tipo: "Cliente",
    region: "Biobío",
    comuna: "Concepción"
  },
  {
    run: "11223344-5",
    nombre: "Admin",
    apellidos: "MilSabores",
    email: "admin@duoc.cl",
    password: "admin", // <--- NUEVO
    tipo: "Administrador",
    region: "Metropolitana",
    comuna: "Providencia"
  }
];

const KEY_USERS_DB = 'usuariosDB';

// --- LÓGICA DE PERSISTENCIA (USUARIOS) ---

const cargarUsuariosBD = (): IUsuario[] => {
  try {
    const guardado = localStorage.getItem(KEY_USERS_DB);
    if (guardado) {
      return JSON.parse(guardado);
    }
    localStorage.setItem(KEY_USERS_DB, JSON.stringify(usuariosIniciales));
    return usuariosIniciales;
  } catch (e) {
    return usuariosIniciales;
  }
};

const guardarUsuariosBD = (datos: IUsuario[]) => {
  localStorage.setItem(KEY_USERS_DB, JSON.stringify(datos));
};

// --- FUNCIONES CRUD USUARIOS ---

export const getUsuarios = async (): Promise<IUsuario[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return cargarUsuariosBD();
};

export const getUsuarioByRun = async (run: string): Promise<IUsuario> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const usuarios = cargarUsuariosBD();
  const usuario = usuarios.find(u => u.run === run);
  if (!usuario) throw new Error('Usuario no encontrado');
  return usuario;
};

export const deleteUsuario = async (run: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let usuarios = cargarUsuariosBD();
  usuarios = usuarios.filter(u => u.run !== run);
  guardarUsuariosBD(usuarios);
};

export const saveUsuario = async (usuario: IUsuario): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let usuarios = cargarUsuariosBD();

  const index = usuarios.findIndex(u => u.run === usuario.run);

  if (index >= 0) {
    usuarios[index] = usuario; // Editar
  } else {
    usuarios.push(usuario); // Crear
  }

  guardarUsuariosBD(usuarios);
};


// 1. NUEVA INTERFAZ: RESEÑA
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

// --- LÓGICA DE PERSISTENCIA (RESEÑAS) ---
const cargarResenasBD = (): IResena[] => {
  try {
    const guardado = localStorage.getItem(KEY_RESENAS);
    return guardado ? JSON.parse(guardado) : resenasIniciales;
  } catch { return resenasIniciales; }
};

const guardarResenasBD = (datos: IResena[]) => {
  localStorage.setItem(KEY_RESENAS, JSON.stringify(datos));
};

// --- FUNCIONES CRUD RESEÑAS ---

// Obtener todas (Para el Admin)
export const getAllResenas = async (): Promise<IResena[]> => {
  await new Promise(r => setTimeout(r, 300));
  return cargarResenasBD();
};

// Obtener solo las de un producto específico (Para la Tienda)
export const getResenasPorProducto = async (codigoProducto: string): Promise<IResena[]> => {
  await new Promise(r => setTimeout(r, 300));
  const todas = cargarResenasBD();
  return todas.filter(r => r.codigoProducto === codigoProducto);
};

// Guardar una nueva reseña
export const saveResena = async (nuevaResena: Omit<IResena, 'id'>): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  let lista = cargarResenasBD();

  // Creamos un ID simple basado en timestamp
  const resenaConId: IResena = { ...nuevaResena, id: Date.now() };

  lista.push(resenaConId);
  guardarResenasBD(lista);
};

// Eliminar reseña (Para el Admin)
export const deleteResena = async (id: number): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  let lista = cargarResenasBD();
  guardarResenasBD(lista.filter(r => r.id !== id));
};







// ----------------------------------------------------------- datos con pedidos ---------------------------------------------------
// 1. Definimos la Interfaz de Pedido (Si ya la tienes arriba, bórrala de aquí)
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

// 2. Funciones auxiliares específicas para Pedidos (Para no depender de cargarDatos genérico)
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

// 3. Funciones CRUD para Pedidos (Exportadas)

export const getAllPedidos = async (): Promise<IPedido[]> => {
  await new Promise(r => setTimeout(r, 300));
  return cargarPedidosBD();
};

export const updateEstadoPedido = async (id: number, nuevoEstado: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  const lista = cargarPedidosBD();
  // Actualizamos el estado
  const listaActualizada = lista.map(p => 
    p.id === id ? { ...p, estado: nuevoEstado } : p
  );
  // @ts-ignore (Ignoramos error de tipo estricto en el string del estado)
  guardarPedidosBD(listaActualizada);
};

export const deletePedido = async (id: number): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
  const lista = cargarPedidosBD();
  // Filtramos para borrar
  const listaActualizada = lista.filter(p => p.id !== id);
  guardarPedidosBD(listaActualizada);
};