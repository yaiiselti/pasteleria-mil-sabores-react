import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { IProducto } from "../services/PasteleriaService";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext"; 

export interface IItemCarrito extends IProducto {
  idUnico: number;
  cantidad: number;
  mensaje: string;
}

interface CarritoContextType {
  items: IItemCarrito[];
  agregarAlCarrito: (producto: IProducto, cantidad: number, mensaje: string) => boolean;
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

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); 
  const { showNotification } = useNotification();
  // Función auxiliar para saber dónde guardar/leer
  const getStorageConfig = (currentUser: any) => {
    if (currentUser) {
      return { key: `carrito_${currentUser.email}`, storage: localStorage };
    } else {
      return { key: 'carrito_invitado', storage: sessionStorage };
    }
  };

  // Inicialización perezosa (Lazy Initialization)
  const [items, setItems] = useState<IItemCarrito[]>(() => {
    const { key, storage } = getStorageConfig(user);
    try {
      const guardado = storage.getItem(key);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  // 1. Efecto para CAMBIAR de usuario
  useEffect(() => {
    const { key, storage } = getStorageConfig(user);
    try {
      const guardado = storage.getItem(key);
      if (guardado) setItems(JSON.parse(guardado));
      else setItems([]); 
    } catch { setItems([]); }
  }, [user]);

  // 2. Efecto para GUARDAR
  useEffect(() => {
    const { key, storage } = getStorageConfig(user);
    storage.setItem(key, JSON.stringify(items));
  }, [items, user]);


  // --- CÁLCULOS Y LÓGICA ---
  const subtotal = items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  let descuentoTotal = 0;

  if (user) {
    if (user.fechaNacimiento) {
      const hoy = new Date();
      const cumple = new Date(user.fechaNacimiento);
      let edad = hoy.getFullYear() - cumple.getFullYear();
      const m = hoy.getMonth() - cumple.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
      
      if (edad >= 50) descuentoTotal += subtotal * 0.50;
    }
    if (user.codigoPromo === 'FELICES50') {
      descuentoTotal += subtotal * 0.10;
    }
  } 

  const totalPrecio = Math.max(0, subtotal - descuentoTotal);
  const totalItems = items.reduce((total, item) => total + item.cantidad, 0);

  // --- FUNCIONES CRUD CON DOBLE CANDADO (Nivel 3) ---

  const agregarAlCarrito = (producto: IProducto, cantidad: number, mensaje: string): boolean => {
    // 1. CÁLCULO DE SEGURIDAD
    const totalActual = items.reduce((acc, item) => acc + item.cantidad, 0);
    const totalFuturo = totalActual + cantidad;

    if (totalFuturo > 1000) {
      showNotification(
        `el límite del carrito es de 1000 productos en total.`,
        'danger'
      );
      return false;
    }

    const mensajeNormalizado = mensaje.trim();
    const itemExistente = items.find(i => i.codigo === producto.codigo && i.mensaje === mensajeNormalizado);
    
    if (itemExistente) {
      setItems(prev => prev.map(i => i.idUnico === itemExistente.idUnico ? { ...i, cantidad: i.cantidad + cantidad } : i));
    } else {
      setItems(prev => [...prev, { ...producto, idUnico: Date.now(), cantidad, mensaje: mensajeNormalizado }]);
    }
    
    return true;
  };

  const eliminarDelCarrito = (id: number) => setItems(prev => prev.filter(i => i.idUnico !== id));
  
  const actualizarCantidad = (id: number, val: number) => {
    if (val < 1) return eliminarDelCarrito(id);
    
    // VALIDACIÓN EXTRA PARA EL CARRITO (Coherencia)
    const itemActual = items.find(i => i.idUnico === id);
    if (itemActual) {
        const diferencia = val - itemActual.cantidad;
        const totalActual = items.reduce((acc, item) => acc + item.cantidad, 0);
        if (totalActual + diferencia > 1000) {
            showNotification(` No puedes superar los 1000 productos en total.`, 'danger');
            return;
        }
    }

    setItems(prev => prev.map(i => i.idUnico === id ? { ...i, cantidad: val } : i));
  };

  const actualizarMensaje = (id: number, msg: string) => {
    setItems(prev => prev.map(i => i.idUnico === id ? { ...i, mensaje: msg } : i));
  };

  const vaciarCarrito = () => setItems([]);

  return (
    <CarritoContext.Provider value={{
      items, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, actualizarMensaje, vaciarCarrito,
      totalItems, totalPrecio, subtotal, descuentoTotal
    }}>
      {children}
    </CarritoContext.Provider>
  );
};