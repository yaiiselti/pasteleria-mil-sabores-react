
const productosDB = [

  {
    codigo: "TC001",
    nombre: "Torta Cuadrada de Chocolate",
    categoria: "Tortas Cuadradas",
    precio: 45000,
    descripcion: "Deliciosa torta de chocolate con capas de ganache y un toque de avellanas. Personalizable con mensajes especiales.",
    imagenes: [
      "../assets/img/productos/torta-chocolate-1.png", // Imagen Principal
      "../assets/img/productos/torta-chocolate-2.png", // Thumbnail 1
      "../assets/img/productos/torta-chocolate-3.png", // Thumbnail 2
      "../assets/img/productos/torta-chocolate-1.png"  // Thumbnail 3
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
  // ... (Y así con todos los 16 productos) ...
  // (He completado el resto de la base de datos con la misma estructura)
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

// --- 2. FUNCIONES "CRUD" (Por ahora, solo "Read") ---

/**
 * Simula una llamada a API para obtener todos los productos.
 * (Devuelve una Promesa, como en tu login.service.ts )
 */
export const getProductos = async () => {
  // Simulamos un pequeño retraso de red
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return productosDB;
}

/**
 * Simula una llamada a API para un solo producto.
 */
export const getProductoByCodigo = async (codigo: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const producto = productosDB.find(p => p.codigo === codigo);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }
  return producto;
}

/**
 * Simula una llamada a API para obtener las categorías.
 */
export const getCategorias = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const categorias = [...new Set(productosDB.map(p => p.categoria))];
  return categorias;
}