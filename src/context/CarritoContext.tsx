import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { IProducto } from "../services/PasteleriaService";

export interface IItemCarrito extends IProducto {
  idUnico: number;
  cantidad: number;
  mensaje: string;
}

interface CarritoContextType {
  items: IItemCarrito[];
  agregarAlCarrito: (producto: IProducto, cantidad: number, mensaje: string) => void;
  eliminarDelCarrito: (idUnico: number) => void;
  actualizarCantidad: (idUnico: number, nuevaCantidad: number) => void;
  // 1. NUEVA FUNCIÓN
  actualizarMensaje: (idUnico: number, nuevoMensaje: string) => void;
  vaciarCarrito: () => void;
  totalItems: number;
  totalPrecio: number;
}

export const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const CarritoProvider = ({ children }: Props) => {
  
  const [items, setItems] = useState<IItemCarrito[]>(() => {
    try {
      const itemsGuardados = localStorage.getItem('carrito');
      return itemsGuardados ? JSON.parse(itemsGuardados) : [];
    } catch (error) {
      console.error("Error al leer localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = (producto: IProducto, cantidad: number, mensaje: string) => {
    const mensajeNormalizado = mensaje.trim();
    const itemExistente = items.find(
      (item) => item.codigo === producto.codigo && item.mensaje === mensajeNormalizado
    );

    if (itemExistente) {
      setItems(prevItems => 
        prevItems.map(item => 
          item.idUnico === itemExistente.idUnico 
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      );
    } else {
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

  // 2. IMPLEMENTACIÓN DE LA NUEVA FUNCIÓN
  const actualizarMensaje = (idUnico: number, nuevoMensaje: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.idUnico === idUnico ? { ...item, mensaje: nuevoMensaje } : item
      )
    );
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.cantidad, 0);
  const totalPrecio = items.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  return (
    <CarritoContext.Provider value={{
      items,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      actualizarMensaje, // <--- Exportamos la función
      vaciarCarrito,
      totalItems,
      totalPrecio
    }}>
      {children}
    </CarritoContext.Provider>
  );
};