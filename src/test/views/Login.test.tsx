import { describe, test, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import Login from '../../views/Login';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { CarritoProvider } from '../../context/CarritoContext';

describe('Vista Login', () => {

    test('9. Debe permitir escribir en los inputs', () => {
        renderWithRouter(
            <NotificationProvider>
                <AuthProvider>
                    <CarritoProvider>
                        <Login />
                    </CarritoProvider>
                </AuthProvider>
            </NotificationProvider>
        );

        const inputEmail = screen.getByLabelText(/Correo/i) as HTMLInputElement;
        const inputPass = screen.getByLabelText(/Contraseña/i) as HTMLInputElement;

        // Simulamos escritura
        fireEvent.change(inputEmail, { target: { value: 'admin@duoc.cl' } });
        fireEvent.change(inputPass, { target: { value: '1234' } });

        expect(inputEmail.value).toBe('admin@duoc.cl');
        expect(inputPass.value).toBe('1234');
    });

    test('10. Debe mostrar botón de ingresar', () => {
        renderWithRouter(
            <NotificationProvider>
                <AuthProvider>
                    <CarritoProvider>
                        <Login />
                    </CarritoProvider>
                </AuthProvider>
            </NotificationProvider>
        );
        
        expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
    });
});