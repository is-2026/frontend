import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { BehaviorsPage } from './BehaviorsPage';
import * as behaviorsService from '../services/behaviors';
import { MemoryRouter } from 'react-router-dom';

// Mockeamos de servicio de los comportamientos
vi.mock('../services/behaviors', () => ({
    getBehaviors: vi.fn(),
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
            { id: '1', name: 'Comportamiento Defensivo', code: 'defend()' },
            { id: '2', name: 'Comportamiento Ofensivo', code: 'attack()' },
            { id: '3', name: 'Comportamiento Equilibrado', code: 'balance()' }
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
});