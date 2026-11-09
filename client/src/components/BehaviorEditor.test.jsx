import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { BehaviorEditor } from './BehaviorEditor';
import { MemoryRouter } from 'react-router-dom';
import * as behaviorsService from '../services/behaviors';

vi.mock('../services/behaviors', () => ({
    createBehavior: vi.fn(),
    updateBehavior: vi.fn(),
    behaviorMatch: vi.fn(),
}));

// Mock del tester para substituir WebSocket
vi.mock('./BehaviorTester', () => ({
    BehaviorTester: ({ behaviorId, setTestLayout }) => (
        <div>
            <p>Tester {behaviorId}</p>
            <button onClick={() => setTestLayout(false)}>Cerrar Prueba</button>
        </div>
    ),
}));

const behavior = { id: '1', name: 'Ofensivo', code: 'attack()' };

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
    test('4. al apretar Probar llama a behaviorMatch y abre el panel de prueba', async () => {
        behaviorsService.behaviorMatch.mockResolvedValueOnce({ match_id: 'm1' });

        render(
            <MemoryRouter>
                <BehaviorEditor isOpen={true} onClose={vi.fn()} initialBehavior={behavior} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Probar'));

        await waitFor(() => {
            expect(behaviorsService.behaviorMatch).toHaveBeenCalledWith('attack()');
            expect(screen.getByText('Tester m1')).toBeInTheDocument();
        });
    });

    test('5. ante un 400 muestra el error debajo del editor y no abre el panel', async () => {
        const error = new Error('El código contiene errores de sintaxis');
        error.status = 400;
        behaviorsService.behaviorMatch.mockRejectedValueOnce(error);

        render(
            <MemoryRouter>
                <BehaviorEditor isOpen={true} onClose={vi.fn()} initialBehavior={behavior} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Probar'));

        await waitFor(() => {
            expect(screen.getByText('El código contiene errores de sintaxis')).toBeInTheDocument();
        });
        expect(screen.queryByText(/Tester/)).not.toBeInTheDocument();
    });

    test('6. bloquea el código y los botones mientras corre la prueba', async () => {
        behaviorsService.behaviorMatch.mockResolvedValueOnce({ match_id: 'm1' });

        render(
            <MemoryRouter>
                <BehaviorEditor isOpen={true} onClose={vi.fn()} initialBehavior={behavior} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Probar'));

        await waitFor(() => {
            expect(screen.getByPlaceholderText('# Escribe tu comportamiento aquí')).toBeDisabled();
            expect(screen.getByText('Probar')).toBeDisabled();
            expect(screen.getByText('Actualizar')).toBeDisabled();
        });
    });

    test('7. al cerrar la prueba se cierra el panel y se habilita el editor', async () => {
        behaviorsService.behaviorMatch.mockResolvedValueOnce({ match_id: 'm1' });

        render(
            <MemoryRouter>
                <BehaviorEditor isOpen={true} onClose={vi.fn()} initialBehavior={behavior} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Probar'));
        fireEvent.click(await screen.findByText('Cerrar Prueba'));

        expect(screen.queryByText('Tester m1')).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('# Escribe tu comportamiento aquí')).not.toBeDisabled();
    });
});