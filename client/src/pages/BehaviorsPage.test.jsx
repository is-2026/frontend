import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { BehaviorsPage } from './BehaviorsPage';
import * as behaviorsService from '../services/behaviors';
import { MemoryRouter } from 'react-router-dom';

// Mockeamos de servicio de los comportamientos
vi.mock('../services/behaviors', () => ({
    getBehaviors: vi.fn(),
    deleteBehavior: vi.fn(),
}));

describe('BehaviorsPage Component', () => {
    test('1. muestra el mensaje de carga al iniciar', () => {
        // Promesa vacía para que quede en el estado inicial
        behaviorsService.getBehaviors.mockReturnValue(new Promise(() => {})); 
        
        render(
            <MemoryRouter>
                <BehaviorsPage />
            </MemoryRouter>
        );
        
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    test('2. muestra los 3 comportamientos default con sus respectivos nombres (Criterio de Aceptación)', async () => {
        // Mock de 3 comportamientos para probar el requerimiento
        const mockData = [
            { id: '1', name: 'Comportamiento Defensivo', code: 'defend()', kind: 'player'  },
            { id: '2', name: 'Comportamiento Ofensivo', code: 'attack()', kind: 'player'  },
            { id: '3', name: 'Comportamiento Equilibrado', code: 'balance()', kind: 'player'  }
        ];
        behaviorsService.getBehaviors.mockResolvedValueOnce(mockData);

        render(
            <MemoryRouter>
                <BehaviorsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            // Verificamos que los 3 nombres de los comportamientos default estén en pantalla
            expect(screen.getByText('Comportamiento Defensivo')).toBeInTheDocument();
            expect(screen.getByText('Comportamiento Ofensivo')).toBeInTheDocument();
            expect(screen.getByText('Comportamiento Equilibrado')).toBeInTheDocument();
            
            // Opcional: Verificar que el código también se muestra
            expect(screen.getByText('defend()')).toBeInTheDocument();
        });
    });

    test('3. muestra mensaje de error si la API falla', async () => {
        behaviorsService.getBehaviors.mockRejectedValueOnce(new Error('Fallo de conexión'));

        render(
            <MemoryRouter>
                <BehaviorsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Fallo de conexión')).toBeInTheDocument();
        });
    });

    test('4. muestra mensaje de lista vacia si no hay comportamientos', async () => {
        behaviorsService.getBehaviors.mockResolvedValueOnce([]);
        render(
            <MemoryRouter>
                <BehaviorsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No se encontraron comportamientos.')).toBeInTheDocument();
        });
    });
    
    test('5. abre el editor de comportamiento al hacer clic en Crear Comportamiento +', async () => {
        behaviorsService.getBehaviors.mockResolvedValueOnce([]);
        render(
            <MemoryRouter>
                <BehaviorsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Crear Comportamiento +')).toBeInTheDocument();
        });

        // Hacemos clic en el botón
        fireEvent.click(screen.getByText('Crear Comportamiento +'));

        // Verificamos que el modal se abrió mostrando el título del editor
        expect(screen.getByText('Editor de Comportamiento')).toBeInTheDocument();
    });

        const mockList = [{ id: '1', name: 'Ofensivo', code: 'attack()', kind: 'player'  }];

    test('cancela la eliminación si el usuario no confirma en el pop-up', async () => {
        behaviorsService.getBehaviors.mockResolvedValueOnce(mockList);
        vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
        render(<MemoryRouter><BehaviorsPage /></MemoryRouter>);
        await waitFor(() => expect(screen.getByText('Ofensivo')).toBeInTheDocument());

        fireEvent.click(screen.getByText('Eliminar'));

        expect(window.confirm).toHaveBeenCalled();
        expect(behaviorsService.deleteBehavior).not.toHaveBeenCalled();
    });

    test('elimina el comportamiento y muestra mensaje de éxito (200)', async () => {
        behaviorsService.getBehaviors.mockResolvedValueOnce(mockList);
        behaviorsService.deleteBehavior.mockResolvedValueOnce({});
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
        render(<MemoryRouter><BehaviorsPage /></MemoryRouter>);
        await waitFor(() => expect(screen.getByText('Ofensivo')).toBeInTheDocument());

        fireEvent.click(screen.getByText('Eliminar'));

        await waitFor(() => {
            expect(behaviorsService.deleteBehavior).toHaveBeenCalledWith('1');
            expect(screen.getByText('Comportamiento eliminado con éxito.')).toBeInTheDocument();
            expect(screen.queryByText('Ofensivo')).not.toBeInTheDocument();
        });
    });

    test('muestra error (409) si el backend rechaza la eliminación', async () => {
        behaviorsService.getBehaviors.mockResolvedValueOnce(mockList);
        const mockError = new Error('El comportamiento está asignado a un jugador.');
        mockError.status = 409;
        behaviorsService.deleteBehavior.mockRejectedValueOnce(mockError);
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
        render(<MemoryRouter><BehaviorsPage /></MemoryRouter>);
        await waitFor(() => expect(screen.getByText('Ofensivo')).toBeInTheDocument());

        fireEvent.click(screen.getByText('Eliminar'));

        await waitFor(() => {
            expect(screen.getByText('El comportamiento está asignado a un jugador.')).toBeInTheDocument();
        });
    });
});