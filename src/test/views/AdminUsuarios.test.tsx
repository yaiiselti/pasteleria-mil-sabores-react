import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import AdminUsuarios from '../../views/admin/AdminUsuarios';
import { NotificationProvider } from '../../context/NotificationContext';
import * as AdminService from '../../services/AdminService';

// Mockeamos el servicio de usuarios
vi.mock('../../services/AdminService', () => ({
    getUsuarios: vi.fn(),
    deleteUsuario: vi.fn()
}));

// Mockeamos el hook de Auth para controlar quién está logueado
// (Esto es un truco avanzado para simular que "soy yo")
const mockLogout = vi.fn();
vi.mock('../../context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        useAuth: () => ({
            user: { run: '22222222-2', nombre: 'Admin Secundario' }, // Usuario conectado actual
            logout: mockLogout
        })
    };
});

describe('Vista AdminUsuarios - Reglas de Seguridad', () => {

    const mockUsuarios = [
        { run: '11223344-5', nombre: 'Super Admin', email: 'admin@duoc.cl', tipo: 'Administrador' },
        { run: '22222222-2', nombre: 'Admin Secundario', email: 'secundario@duoc.cl', tipo: 'Administrador' }, // Soy yo
        { run: '33333333-3', nombre: 'Cliente Juan', email: 'juan@gmail.com', tipo: 'Cliente' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (AdminService.getUsuarios as any).mockResolvedValue(mockUsuarios);
    });

    test('1. El Super Admin debe ser intocable (Botón deshabilitado)', async () => {
        renderWithRouter(
            <NotificationProvider>
                <AdminUsuarios />
            </NotificationProvider>
        );

        await waitFor(() => screen.getByText('Super Admin'));

        // Buscamos todos los botones de eliminar
        const botonesEliminar = screen.getAllByTitle(/Eliminar/i);
        
        // El primer usuario es el Super Admin. Su botón debe estar deshabilitado.
        expect(botonesEliminar[0]).toBeDisabled();
    });

    test('2. Puedo eliminar a un cliente normal', async () => {
        renderWithRouter(
            <NotificationProvider>
                <AdminUsuarios />
            </NotificationProvider>
        );

        await waitFor(() => screen.getByText('Cliente Juan'));

        // Buscamos el botón de eliminar del cliente (índice 2 en el array)
        const botonesEliminar = screen.getAllByTitle(/Eliminar/i);
        const btnCliente = botonesEliminar[2];

        // Hacemos clic
        fireEvent.click(btnCliente);

        // Debe aparecer el modal de confirmación normal
        expect(screen.getByText(/¿Estás seguro de eliminar al usuario/i)).toBeInTheDocument();
        
        // Confirmamos
        const btnConfirmar = screen.getByText('Confirmar');
        fireEvent.click(btnConfirmar);

        await waitFor(() => {
            expect(AdminService.deleteUsuario).toHaveBeenCalledWith('33333333-3');
        });
    });

    test('3. Si me elimino a mí mismo, debe hacer Logout', async () => {
        renderWithRouter(
            <NotificationProvider>
                <AdminUsuarios />
            </NotificationProvider>
        );

        await waitFor(() => screen.getByText('Admin Secundario'));

        // Buscamos mi propio botón (índice 1)
        const botonesEliminar = screen.getAllByTitle(/Eliminar/i);
        const miBoton = botonesEliminar[1];

        fireEvent.click(miBoton);

        // El modal debe tener la advertencia especial
        expect(screen.getByText(/ADVERTENCIA DE SEGURIDAD/i)).toBeInTheDocument();

        // Confirmamos el "suicidio digital"
        const btnConfirmar = screen.getByText('Confirmar');
        fireEvent.click(btnConfirmar);

        await waitFor(() => {
            // Verificamos que se llamó a la función de borrar
            expect(AdminService.deleteUsuario).toHaveBeenCalledWith('22222222-2');
            // Y LO MÁS IMPORTANTE: Que se llamó a logout()
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});