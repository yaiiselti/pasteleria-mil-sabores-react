import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { IProducto } from "../services/PasteleriaService";
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
  subtotal: number;
  descuentoTotal: number;
}

export const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const CarritoProvider = ({ children }: Props) => {
  const { user } = useAuth();

  // Función auxiliar para saber dónde leer/guardar
  // (La sacamos afuera del efecto para usarla en el estado inicial)
  const getStorageConfig = (currentUser: any) => {
    if (currentUser) {
      return {
        key: `carrito_${currentUser.email}`, 
        storage: localStorage         
      };
    } else {
      return {
        key: 'carrito_invitado',         
        storage: sessionStorage       
      };
    }
  };

  // --- CAMBIO CLAVE: INICIALIZACIÓN PEREZOSA ---
  // En lugar de empezar con [], leemos el storage AL TIRO.
  // Esto evita que al refrescar la página se sobrescriba con vacío.
  const [items, setItems] = useState<IItemCarrito[]>(() => {
    const { key, storage } = getStorageConfig(user);
    try {
      const guardado = storage.getItem(key);
      return guardado ? JSON.parse(guardado) : [];
    } catch (error) {
      return [];
    }
  });

  // 1. Efecto para CAMBIAR DE USUARIO (Login/Logout)
  // Solo se ejecuta si cambia el usuario, para cargar SU carrito específico
  useEffect(() => {
    const { key, storage } = getStorageConfig(user);
    try {
      const guardado = storage.getItem(key);
      if (guardado) {
        setItems(JSON.parse(guardado));
      } else {
        // Si el usuario no tiene carrito guardado, empezamos limpio
        // Opcional: Podrías NO limpiar si quieres "heredar" el carrito de invitado
        setItems([]); 
      }
    } catch (error) {
      setItems([]);
    }
  }, [user]); 

  // 2. Efecto para GUARDAR cambios
  // Se ejecuta cada vez que agregas/quitas productos
  useEffect(() => {
    const { storage, key } = getStorageConfig(user);
    storage.setItem(key, JSON.stringify(items));
  }, [items, user]);


  // --- CÁLCULOS (Se mantienen igual) ---
  const subtotal = items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  let descuentoTotal = 0;

  if (user) {
    const ganoDescuentoEdad = localStorage.getItem('descuentoEdad') === 'true';
    const ganoDescuentoCodigo = localStorage.getItem('descuentoCodigo') === 'true';

    if (ganoDescuentoEdad) descuentoTotal += subtotal * 0.50; 
    if (ganoDescuentoCodigo) descuentoTotal += subtotal * 0.10; 
  } 

  const totalPrecio = Math.max(0, subtotal - descuentoTotal);
  const totalItems = items.reduce((total, item) => total + item.cantidad, 0);

  // --- FUNCIONES CRUD (Se mantienen igual) ---
  const agregarAlCarrito = (producto: IProducto, cantidad: number, mensaje: string) => {
    const mensajeNormalizado = mensaje.trim();
    const itemExistente = items.find(
      (item) => item.codigo === producto.codigo && item.mensaje === mensajeNormalizado
    );

    if (itemExistente) {
      setItems(prev => 
        prev.map(item => 
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
      setItems(prev => [...prev, nuevoItem]);
    }
  };

  const eliminarDelCarrito = (id: number) => {
    setItems(prev => prev.filter(item => item.idUnico !== id));
  };

  const actualizarCantidad = (id: number, val: number) => {
    if (val < 1) {
      eliminarDelCarrito(id);
      return;
    }
    setItems(prev => 
      prev.map(item => item.idUnico === id ? { ...item, cantidad: val } : item)
    );
  };

  const actualizarMensaje = (id: number, msg: string) => {
    setItems(prev => 
      prev.map(item => item.idUnico === id ? { ...item, mensaje: msg } : item)
    );
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  return (
    <CarritoContext.Provider value={{
      items,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      actualizarMensaje,
      vaciarCarrito,
      totalItems,
      totalPrecio,    
      subtotal,       
      descuentoTotal 
    }}>
      {children}
    </CarritoContext.Provider>
  );
};