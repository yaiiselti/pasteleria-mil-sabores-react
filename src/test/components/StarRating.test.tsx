import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { StarRating } from '../../components/StarRating';
import { vi } from 'vitest'; // Para simular funciones (mocks)

describe('Componente StarRating', () => {

    test('7. Debe renderizar 5 estrellas por defecto', () => {
        const { container } = render(<StarRating calificacion={0} />);
        // Buscamos cuántos elementos <svg> hay
        const estrellas = container.querySelectorAll('svg');
        expect(estrellas.length).toBe(5);
    });

    test('8. Debe llamar a la función onRate al hacer clic', () => {
        // Creamos una función espía (mock)
        const handleRate = vi.fn();
        
        const { container } = render(<StarRating calificacion={0} onRate={handleRate} />);
        const estrellas = container.querySelectorAll('svg');
        
        // Hacemos clic en la 3ra estrella (índice 2)
        fireEvent.click(estrellas[2]);

        // Verificamos que se llamó con el valor 3
        expect(handleRate).toHaveBeenCalledWith(3);
    });
});