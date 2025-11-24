import { describe, test, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../utils/renderWithRouter';
import Header from '../../components/Header';
// Importamos los contextos necesarios para que el Header no falle
import { CarritoProvider } from '../../context/CarritoContext';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

describe('Componente Header', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    test('5. Debe mostrar el nombre de la pastelería', () => {
        renderWithRouter(
            <NotificationProvider>
                <AuthProvider>
                    <CarritoProvider>
                        <Header />
                    </CarritoProvider>
                </AuthProvider>
            </NotificationProvider>
        );

        const titulo = screen.getByText(/Pastelería Mil Sabores/i);
        expect(titulo).toBeInTheDocument();
    });

    test('6. Debe mostrar "Iniciar Sesión" si no hay usuario', () => {
        renderWithRouter(
            <NotificationProvider>
                <AuthProvider>
                    <CarritoProvider>
                        <Header />
                    </CarritoProvider>
                </AuthProvider>
            </NotificationProvider>
        );

        expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
    });
});