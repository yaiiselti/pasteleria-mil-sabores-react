import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { IProducto } from "../services/PasteleriaService"; // Importamos el tipo base

// Definimos la forma de un ítem en el carrito (Producto + Datos de compra)
export interface IItemCarrito extends IProducto {
  idUnico: number; // ID único para diferenciar productos iguales con distinto mensaje
  cantidad: number;
  mensaje: string;
}

// Definimos qué datos y funciones "exportará" este contexto al resto de la app
interface CarritoContextType {
  items: IItemCarrito[];
  agregarAlCarrito: (producto: IProducto, cantidad: number, mensaje: string) => void;
  eliminarDelCarrito: (idUnico: number) => void;
  actualizarCantidad: (idUnico: number, nuevaCantidad: number) => void;
  vaciarCarrito: () => void;
  totalItems: number;
  totalPrecio: number;
}

// Creamos el Contexto
export const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

// Creamos el Proveedor (El componente que envuelve a la app)
interface Props {
  children: ReactNode;
}

export const CarritoProvider = ({ children }: Props) => {
  
  // 1. ESTADO: Inicializamos leyendo de localStorage para persistencia
  const [items, setItems] = useState<IItemCarrito[]>(() => {
    try {
      const itemsGuardados = localStorage.getItem('carrito');
      return itemsGuardados ? JSON.parse(itemsGuardados) : [];
    } catch (error) {
      console.error("Error al leer localStorage:", error);
      return [];
    }
  });

  // 2. EFECTO: Guardamos en localStorage cada vez que 'items' cambia
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  // 3. LÓGICA DE NEGOCIO (Migrada y mejorada de main.js)

  const agregarAlCarrito = (producto: IProducto, cantidad: number, mensaje: string) => {
    const mensajeNormalizado = mensaje.trim();
    
    // Buscamos si ya existe exactamente el mismo producto con el mismo mensaje
    const itemExistente = items.find(
      (item) => item.codigo === producto.codigo && item.mensaje === mensajeNormalizado
    );

    if (itemExistente) {
      // Si existe, solo sumamos la cantidad
      setItems(prevItems => 
        prevItems.map(item => 
          item.idUnico === itemExistente.idUnico 
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      );
    } else {
      // Si no existe, creamos uno nuevo con un ID único (timestamp)
      const nuevoItem: IItemCarrito = {
        ...producto,
        idUnico: Date.now(), 
        cantidad: cantidad,
        mensaje: mensajeNormalizado,
      };
      setItems(prevItems => [...prevItems, nuevoItem]);
    }
  };

  const eliminarDelCarrito = (idUnico: number) => {
    setItems(prevItems => prevItems.filter(item => item.idUnico !== idUnico));
  };

  const actualizarCantidad = (idUnico: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(idUnico);
      return;
    }
    setItems(prevItems => 
      prevItems.map(item => 
        item.idUnico === idUnico ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  // 4. CALCULOS AUTOMÁTICOS
  const totalItems = items.reduce((total, item) => total + item.cantidad, 0);
  const totalPrecio = items.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  return (
    <CarritoContext.Provider value={{
      items,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      vaciarCarrito,
      totalItems,
      totalPrecio
    }}>
      {children}
    </CarritoContext.Provider>
  );
};