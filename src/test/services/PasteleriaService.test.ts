import { describe, test, expect, beforeEach } from 'vitest';
import { getProductos, getProductoByCodigo, getUsuarios, getAllPedidos,saveResena } from '../../services/PasteleriaService';

describe('PasteleriaService - Lógica de Datos', () => {
    
    beforeEach(() => {
        localStorage.clear();
    });

    test('1. getProductos debe devolver la lista inicial de tortas', async () => {
        const productos = await getProductos();
        expect(productos).toBeDefined();
        expect(productos.length).toBeGreaterThan(0); // Debe haber al menos 1
        expect(productos[0]).toHaveProperty('codigo'); // Debe tener código
    });

    test('2. getProductoByCodigo debe encontrar la Torta de Chocolate (TC001)', async () => {
        const codigo = 'TC001';
        const producto = await getProductoByCodigo(codigo);
        
        expect(producto).toBeDefined();
        expect(producto.nombre).toContain('Chocolate');
        expect(producto.precio).toBeGreaterThan(0);
    });

    // PRUEBA 3: Buscar producto inexistente (Manejo de errores)
    test('3. getProductoByCodigo debe fallar si el código no existe', async () => {
        await expect(getProductoByCodigo('CODIGO_FANTASMA')).rejects.toThrow();
    });

    // PRUEBA 4: Verificar usuarios iniciales
    test('4. getUsuarios debe traer al admin y clientes por defecto', async () => {
        const usuarios = await getUsuarios();
        const admin = usuarios.find(u => u.email === 'admin@duoc.cl');
        
        expect(usuarios.length).toBeGreaterThan(0);
        expect(admin).toBeDefined();
        expect(admin?.tipo).toBe('Administrador');
    });
});

test('getAllPedidos: Debe devolver un array (vacío o con datos)', async () => {
        const pedidos = await getAllPedidos(); // Asegúrate de importar esta función arriba
        expect(pedidos).toBeDefined();
        expect(Array.isArray(pedidos)).toBe(true);
    });

    test('saveResena: Debe permitir guardar una opinión', async () => {
        const nuevaResena = {
            codigoProducto: 'TC001',
            emailUsuario: 'test@duoc.cl',
            nombreUsuario: 'Tester',
            calificacion: 5,
            comentario: 'Prueba unitaria',
            fecha: '01/01/2025'
        };
        
        // No debe lanzar error
        await expect(saveResena(nuevaResena)).resolves.not.toThrow();
    });