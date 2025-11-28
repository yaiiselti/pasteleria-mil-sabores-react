import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import Checkout from '../../views/Checkout';
import { CarritoProvider } from '../../context/CarritoContext';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import * as PasteleriaService from '../../services/PasteleriaService';

// Mockeamos el servicio para controlar qué productos están "activos"
vi.mock('../../services/PasteleriaService', () => ({
    getProductos: vi.fn()
}));

describe('Vista Checkout - Validación de Stock en Tiempo Real', () => {
    
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.clearAllMocks();
        
        // PREPARACIÓN: Inyectamos un producto en el carrito del invitado
        const itemsMock = [{ 
            codigo: 'TC001', nombre: 'Torta Test', precio: 10000, cantidad: 1, 
            descripcion: '', imagenes: [], mensaje: '', idUnico: 123 
        }];
        sessionStorage.setItem('carrito_invitado', JSON.stringify(itemsMock));
    });

    test('Debe bloquear la compra si un producto del carrito está inactivo', async () => {
        // SIMULACIÓN: La base de datos responde que la Torta Test está inactiva (activo: false)
        (PasteleriaService.getProductos as any).mockResolvedValue([
            { codigo: 'TC001', nombre: 'Torta Test', precio: 10000, activo: false } 
        ]);

        renderWithRouter(
            <NotificationProvider><AuthProvider><CarritoProvider>
                <Checkout />
            </CarritoProvider></AuthProvider></NotificationProvider>
        );

        // 1. Llenamos el formulario rápidamente (usando Placeholders para ir a la segura)
        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Tester' } });
        fireEvent.change(screen.getByPlaceholderText(/tu@ejemplo.com/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Calle 123/i), { target: { value: 'Calle Falsa 123' } });
        
        // Fecha futura válida
        const fechaFutura = new Date();
        fechaFutura.setDate(fechaFutura.getDate() + 5);
        const fechaStr = fechaFutura.toISOString().split('T')[0];
        fireEvent.change(screen.getByLabelText(/Fecha de Entrega/i), { target: { value: fechaStr } });

        // Seleccionamos Transferencia (para no validar tarjeta)
        const radioTransferencia = screen.getByLabelText(/Transferencia Bancaria/i);
        fireEvent.click(radioTransferencia);
        
        // Esperamos que aparezca el campo de comprobante y lo llenamos
        await waitFor(() => {
            const inputComprobante = screen.getByPlaceholderText(/Ej: 12345678/i);
            fireEvent.change(inputComprobante, { target: { value: '123456' } });
        });

        // 2. INTENTAR PAGAR
        const botonPagar = screen.getByText(/Confirmar Pedido/i);
        fireEvent.click(botonPagar);

        // 3. VERIFICACIÓN: Debe aparecer la alerta de error de disponibilidad
        await waitFor(() => {
            // Buscamos parte del mensaje de error específico
            expect(screen.getByText(/ya no están disponibles/i)).toBeInTheDocument();
        });
    });
});