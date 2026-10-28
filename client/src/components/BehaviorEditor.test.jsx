import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { BehaviorEditor } from './BehaviorEditor';
import { MemoryRouter } from 'react-router-dom';

describe('BehaviorEditor', () => {
    test('1. renderiza correctamente el componente en el DOM si isOpen es true', () => {
        render(
            <MemoryRouter>
                <BehaviorEditor isOpen={true} onClose={vi.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByText('Editor de Comportamiento')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nombre del comportamiento')).toBeInTheDocument();
    });

    test('2. no renderiza el componente en el DOM si isOpen es false', () => {
        const { container } = render(
            <MemoryRouter>
                <BehaviorEditor isOpen={false} onClose={vi.fn()} />
            </MemoryRouter>
        );
        expect(container).toBeEmptyDOMElement();
    });

    test('3. deshabilita el boton de guardar si el nombre esta vacio', () => {
        render(
            <MemoryRouter>
                <BehaviorEditor isOpen={true} onClose={vi.fn()} />
            </MemoryRouter>
        );
        const button = screen.getByText('Crear');
        expect(button).toBeDisabled();
    });
});