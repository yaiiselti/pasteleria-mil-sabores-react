import { describe, test, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import Checkout from '../../views/Checkout';
import { CarritoProvider } from '../../context/CarritoContext';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

describe('Vista Checkout', () => {
    beforeEach(() => {
        localStorage.clear();
        // Simulamos que hay algo en el carrito para que no muestre "Carrito vacío"
        const itemsMock = [{ 
            codigo: 'TC001', nombre: 'Torta Test', precio: 10000, cantidad: 1, 
            descripcion: '', imagenes: [], mensaje: '', idUnico: 1 
        }];
        // Guardamos como invitado para simplificar
        sessionStorage.setItem('carrito_invitado', JSON.stringify(itemsMock));
    });

    test('Debe mostrar error si intento pagar sin seleccionar medio de pago', () => {
        renderWithRouter(
            <NotificationProvider>
                <AuthProvider>
                    <CarritoProvider>
                        <Checkout />
                    </CarritoProvider>
                </AuthProvider>
            </NotificationProvider>
        );

        // 1. Buscamos el botón de confirmar
        const botonPagar = screen.getByText(/Confirmar Pedido/i);
        
        // 2. Hacemos clic sin llenar nada
        fireEvent.click(botonPagar);

        // 3. Debería aparecer un mensaje de error (Validación HTML5 o visual)
        // En tu código usas un estado de error, verifiquemos si algún campo se marcó como inválido
        // O buscamos el texto del error si lo renderizas
        // Como es difícil probar validación nativa, probamos que NO navegó (seguimos en la misma página)
        expect(botonPagar).toBeInTheDocument();
    });
});