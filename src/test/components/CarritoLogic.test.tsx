import { describe, test, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import Carrito from '../../views/Carrito';
import { CarritoProvider } from '../../context/CarritoContext';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

describe('Lógica del Carrito', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        
        // INYECTAMOS DATOS: 1 Torta de $10.000
        const itemsMock = [{ 
            codigo: 'T-TEST', nombre: 'Torta Test', precio: 10000, cantidad: 2, 
            descripcion: '', imagenes: [''], mensaje: '', idUnico: 123 
        }];
        // Usamos sessionStorage (Invitado) por defecto
        sessionStorage.setItem('carrito_invitado', JSON.stringify(itemsMock));
    });

    test('Debe calcular correctamente el subtotal (10.000 x 2 = 20.000)', async () => {
        renderWithRouter(
            <NotificationProvider>
                <AuthProvider>
                    <CarritoProvider>
                        <Carrito />
                    </CarritoProvider>
                </AuthProvider>
            </NotificationProvider>
        );

        // Buscamos el texto del precio. 
        // Como tu función formatea, buscamos algo que contenga "20.000"
        // findByText es asíncrono, espera a que cargue
        const precioTotal = await screen.findAllByText(/\$20.000/); 
        expect(precioTotal.length).toBeGreaterThan(0);
    });
});