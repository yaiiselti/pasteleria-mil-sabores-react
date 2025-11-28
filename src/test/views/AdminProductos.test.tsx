import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import AdminProductos from '../../views/admin/AdminProductos';
import { NotificationProvider } from '../../context/NotificationContext';
import * as PasteleriaService from '../../services/PasteleriaService';

// 1. Mockeamos el servicio completo para controlar los datos
vi.mock('../../services/PasteleriaService', () => ({
    getProductos: vi.fn(),
    deleteProducto: vi.fn(),
    toggleEstadoProducto: vi.fn()
}));

describe('Vista AdminProductos - Gestión de Catálogo', () => {

    // Datos de prueba: Un producto activo y uno inactivo
    const mockProductos = [
        { codigo: 'P1', nombre: 'Torta Activa', precio: 10000, categoria: 'Tortas', activo: true, imagenes: ['img1.jpg'] },
        { codigo: 'P2', nombre: 'Torta Pausada', precio: 20000, categoria: 'Tortas', activo: false, imagenes: ['img2.jpg'] }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Configuramos el mock para que devuelva nuestros datos de prueba
        (PasteleriaService.getProductos as any).mockResolvedValue(mockProductos);
    });

    test('1. Debe mostrar todos los productos al cargar (Activos y Pausados)', async () => {
        renderWithRouter(
            <NotificationProvider>
                <AdminProductos />
            </NotificationProvider>
        );

        // Esperamos a que carguen los datos
        await waitFor(() => {
            expect(screen.getByText('Torta Activa')).toBeInTheDocument();
            expect(screen.getByText('Torta Pausada')).toBeInTheDocument();
        });
    });

    test('2. El filtro "Solo Disponibles" debe ocultar los productos pausados', async () => {
        renderWithRouter(
            <NotificationProvider>
                <AdminProductos />
            </NotificationProvider>
        );

        // Esperamos la carga inicial
        await waitFor(() => screen.getByText('Torta Activa'));

        // Buscamos el selector de disponibilidad
        const selector = screen.getByLabelText(/Disponibilidad/i);
        
        // Cambiamos el valor a 'activos' (que es el value de la opción "Solo Disponibles")
        fireEvent.change(selector, { target: { value: 'activos' } });

        // Verificamos: La activa debe estar, la pausada NO
        expect(screen.getByText('Torta Activa')).toBeInTheDocument();
        expect(screen.queryByText('Torta Pausada')).not.toBeInTheDocument();
    });

    test('3. Hacer clic en el Switch debe llamar a la función toggleEstadoProducto', async () => {
        // Simulamos que la función toggle devuelve 'false' (éxito)
        (PasteleriaService.toggleEstadoProducto as any).mockResolvedValue(false);

        renderWithRouter(
            <NotificationProvider>
                <AdminProductos />
            </NotificationProvider>
        );

        await waitFor(() => screen.getByText('Torta Activa'));

        // Buscamos todos los switches (checkboxes)
        const switches = screen.getAllByRole('checkbox');
        // El primer switch corresponde a la Torta Activa (P1)
        const switchP1 = switches[0];

        // Hacemos clic para desactivarla
        fireEvent.click(switchP1);

        // Verificamos que el servicio se llamó con el código correcto ('P1')
        expect(PasteleriaService.toggleEstadoProducto).toHaveBeenCalledWith('P1');
    });
});