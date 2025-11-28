import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import Contacto from '../../views/Contacto';
import { NotificationProvider } from '../../context/NotificationContext';
import * as ContactoService from '../../services/ContactoService';

// Mock del servicio
vi.mock('../../services/ContactoService', () => ({
    saveMensaje: vi.fn().mockResolvedValue(true)
}));

describe('Vista Contacto - Validaciones Profesionales', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Debe mostrar error si los correos no coinciden', async () => {
        renderWithRouter(
            <NotificationProvider>
                <Contacto />
            </NotificationProvider>
        );

        // Llenamos datos usando Placeholders (más robusto)
        fireEvent.change(screen.getByPlaceholderText(/Tu nombre/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByPlaceholderText(/Escribe tu mensaje/i), { target: { value: 'Hola mundo' } });
        
        // Correos DIFERENTES
        fireEvent.change(screen.getByPlaceholderText(/ejemplo@correo.com/i), { target: { value: 'juan@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Repite tu correo/i), { target: { value: 'pedro@gmail.com' } });

        // Intentar Enviar
        const boton = screen.getByRole('button', { name: /Enviar Mensaje/i });
        fireEvent.click(boton);

        // Verificamos que NO llamó al servicio (se bloqueó antes)
        expect(ContactoService.saveMensaje).not.toHaveBeenCalled();
        
        // Verificamos mensaje de error visual
        await waitFor(() => {
            expect(screen.getByText(/correos electrónicos no coinciden/i)).toBeInTheDocument();
        });
    });

    test('Debe enviar exitosamente si todo está correcto', async () => {
        renderWithRouter(
            <NotificationProvider>
                <Contacto />
            </NotificationProvider>
        );

        // Llenamos datos CORRECTOS
        fireEvent.change(screen.getByPlaceholderText(/Tu nombre/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByPlaceholderText(/ejemplo@correo.com/i), { target: { value: 'juan@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Repite tu correo/i), { target: { value: 'juan@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Escribe tu mensaje/i), { target: { value: 'Consulta válida' } });

        // Enviar
        const boton = screen.getByRole('button', { name: /Enviar Mensaje/i });
        fireEvent.click(boton);

        // Verificamos que SÍ llamó al servicio
        await waitFor(() => {
            expect(ContactoService.saveMensaje).toHaveBeenCalled();
        });
    });
});