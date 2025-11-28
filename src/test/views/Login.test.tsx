import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import Login from '../../views/Login';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { CarritoProvider } from '../../context/CarritoContext';
import * as AdminService from '../../services/AdminService';

// Mockeamos el servicio de Admin para controlar las respuestas
vi.mock('../../services/AdminService', () => ({
    getUsuarios: vi.fn(),
    getUsuarioByRun: vi.fn(),
    setUsuarioPin: vi.fn()
}));

describe('Vista Login - Seguridad Reforzada', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        
        // Configuración por defecto: Admin con PIN '1234'
        (AdminService.getUsuarios as any).mockResolvedValue([
            { 
                run: '11223344-5', 
                email: 'admin@duoc.cl', 
                password: 'admin', 
                nombre: 'Admin', 
                tipo: 'Administrador',
                pin: '1234' 
            }
        ]);

        (AdminService.getUsuarioByRun as any).mockResolvedValue({
            run: '11223344-5',
            pin: '1234'
        });
    });

    test('1. Cliente normal entra directo a la tienda', async () => {
        // Simulamos un cliente en la BD
        (AdminService.getUsuarios as any).mockResolvedValue([
            { email: 'cliente@test.cl', password: '1234', nombre: 'Cliente', tipo: 'Cliente', run: '1-9' }
        ]);

        renderWithRouter(
            <NotificationProvider><AuthProvider><CarritoProvider>
                <Login />
            </CarritoProvider></AuthProvider></NotificationProvider>
        );

        // CAMBIO: Usamos el placeholder para encontrar los inputs (más robusto en este caso)
        const inputEmail = screen.getByPlaceholderText(/admin@duoc.cl/i);
        const inputPass = screen.getByPlaceholderText(/Ingresa tu contraseña/i);

        fireEvent.change(inputEmail, { target: { value: 'cliente@test.cl' } });
        fireEvent.change(inputPass, { target: { value: '1234' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        // Esperamos que NO aparezca el modal de seguridad
        await waitFor(() => {
            expect(screen.queryByText(/Seguridad de Admin/i)).not.toBeInTheDocument();
        });
    });

    test('2. Admin debe ver el Modal de PIN antes de entrar', async () => {
        renderWithRouter(
            <NotificationProvider><AuthProvider><CarritoProvider>
                <Login />
            </CarritoProvider></AuthProvider></NotificationProvider>
        );

        // Login como Admin
        const inputEmail = screen.getByPlaceholderText(/admin@duoc.cl/i);
        const inputPass = screen.getByPlaceholderText(/Ingresa tu contraseña/i);

        fireEvent.change(inputEmail, { target: { value: 'admin@duoc.cl' } });
        fireEvent.change(inputPass, { target: { value: 'admin' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        // DEBE aparecer el modal de seguridad (input del PIN)
        await waitFor(() => {
            expect(screen.getByText(/Seguridad de Admin/i)).toBeInTheDocument();
            // El input del PIN tiene el placeholder "****"
            expect(screen.getByPlaceholderText('****')).toBeInTheDocument();
        });
    });
});