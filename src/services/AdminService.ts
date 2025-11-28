// src/services/AdminService.ts

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
  pin?: string; // <--- NUEVO CAMPO: PIN de Seguridad
}

// 1. SUPER ADMIN CONSTANTE (Con PIN inicial)
const SUPER_ADMIN: IUsuario = {
  run: "11223344-5",
  nombre: "Admin",
  apellidos: "MilSabores",
  email: "admin@duoc.cl",
  password: "admin",
  tipo: "Administrador",
  region: "Metropolitana",
  comuna: "Providencia",
  pin: "1234" // <--- PIN POR DEFECTO DEL JEFE (Cámbialo después si quieres)
};

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
  SUPER_ADMIN 
];

const KEY_USERS_DB = 'usuariosDB';

// --- LÓGICA DE PERSISTENCIA ---

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

// --- FUNCIONES CRUD ---

export const getUsuarios = async (): Promise<IUsuario[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let usuarios = cargarUsuariosBD();

  // AUTOCURACIÓN: Si borraron al admin, lo restauramos
  const existeAdmin = usuarios.some(u => u.run === SUPER_ADMIN.run || u.email === SUPER_ADMIN.email);
  
  if (!existeAdmin) {
    console.warn("⚠️ ALERTA: Restaurando Super Admin...");
    usuarios.push(SUPER_ADMIN);
    guardarUsuariosBD(usuarios);
  }

  return usuarios;
};

export const getUsuarioByRun = async (run: string): Promise<IUsuario> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const usuarios = await getUsuarios();
  const usuario = usuarios.find(u => u.run === run);
  if (!usuario) throw new Error('Usuario no encontrado');
  return usuario;
};

export const deleteUsuario = async (run: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (run === SUPER_ADMIN.run) {
    throw new Error("Acción denegada: No se puede eliminar al Super Admin.");
  }

  let usuarios = cargarUsuariosBD();
  usuarios = usuarios.filter(u => u.run !== run);
  guardarUsuariosBD(usuarios);
};

export const saveUsuario = async (usuario: IUsuario): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let usuarios = cargarUsuariosBD();

  const index = usuarios.findIndex(u => u.run === usuario.run);

  if (index >= 0) {
    // Si editan al super admin, forzamos que siga siendo Admin
    if (usuario.run === SUPER_ADMIN.run) {
        usuario.tipo = 'Administrador'; 
    }
    
    // PRESERVAR EL PIN: Si estamos editando desde un formulario que no tiene el campo PIN,
    // debemos asegurarnos de no borrar el PIN que ya tenía el usuario.
    const usuarioAntiguo = usuarios[index];
    if (usuario.pin === undefined) {
        usuario.pin = usuarioAntiguo.pin;
    }

    usuarios[index] = usuario; 
  } else {
    usuarios.push(usuario); 
  }

  guardarUsuariosBD(usuarios);
};

// Nueva función exclusiva para actualizar el PIN
export const setUsuarioPin = async (run: string, newPin: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 300));
    let usuarios = cargarUsuariosBD();
    const index = usuarios.findIndex(u => u.run === run);
    if (index >= 0) {
        usuarios[index].pin = newPin;
        guardarUsuariosBD(usuarios);
    }
};