import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { IProducto } from "../services/PasteleriaService";
// 1. Importamos el Auth para saber quién está comprando
import { useAuth } from "./AuthContext";

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
  const { user } = useAuth(); // Obtenemos el usuario actual
  const [items, setItems] = useState<IItemCarrito[]>([]);

  // --- LÓGICA INTELIGENTE DE ALMACENAMIENTO ---
  
  // Función auxiliar para saber dónde guardar/leer
  const getStorageConfig = () => {
    if (user) {
      // USUARIO: Guardamos en localStorage (Permanente) con su email
      return {
        storage: localStorage,
        key: `carrito_usuario_${user.email}`
      };
    } else {
      // INVITADO: Guardamos en sessionStorage (Temporal / Tiempo límite)
      return {
        storage: sessionStorage,
        key: 'carrito_invitado'
      };
    }
  };

  // 1. CARGAR CARRITO: Se ejecuta cuando cambia el usuario (Login/Logout)
  useEffect(() => {
    const { storage, key } = getStorageConfig();
    try {
      const guardado = storage.getItem(key);
      if (guardado) {
        setItems(JSON.parse(guardado));
      } else {
        setItems([]); // Si es un usuario nuevo o invitado nuevo, empezamos vacíos
      }
    } catch (error) {
      console.error("Error al cargar el carrito", error);
      setItems([]);
    }
  }, [user]); // <- Dependencia clave: si cambia 'user', recargamos.

  // 2. GUARDAR CARRITO: Se ejecuta cada vez que modificamos los productos
  useEffect(() => {
    const { storage, key } = getStorageConfig();
    storage.setItem(key, JSON.stringify(items));
  }, [items, user]);


  // --- FUNCIONES DEL CARRITO (Se mantienen igual) ---

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
      actualizarMensaje,
      vaciarCarrito,
      totalItems,
      totalPrecio
    }}>
      {children}
    </CarritoContext.Provider>
  );
};