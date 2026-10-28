import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BehaviorDetail } from './BehaviorDetail';
import * as behaviorsService from '../services/behaviors';

vi.mock('../services/behaviors', () => ({
    getBehaviorById: vi.fn(),
}));

describe('BehaviorDetail', () => {
    test('renderiza el nombre y codigo del comportamiento', async () => {
        behaviorsService.getBehaviorById.mockResolvedValueOnce({
            name: 'Ofensivo',
            code: 'attack()'
        });

        render(
            <MemoryRouter initialEntries={['/club/behaviors/1']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ofensivo')).toBeInTheDocument();
            expect(screen.getByText('attack()')).toBeInTheDocument();
        });
    });

    test('muestra el error y el boton de volver si falla la peticion', async () => {
        behaviorsService.getBehaviorById.mockRejectedValueOnce(new Error('404'));

        render(
            <MemoryRouter initialEntries={['/club/behaviors/99']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/El comportamiento no existe/i)).toBeInTheDocument();
            expect(screen.getByText('Volver a comportamientos')).toBeInTheDocument();
        });
    });

    test('abre el modal de edición al hacer clic en Editar comportamiento', async () => {
        behaviorsService.getBehaviorById.mockResolvedValueOnce({
            id: '1',
            name: 'Ofensivo',
            code: 'attack()'
        });

        render(
            <MemoryRouter initialEntries={['/club/behaviors/1']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ofensivo')).toBeInTheDocument();
            expect(screen.getByText('Editar comportamiento')).toBeInTheDocument();
        });

        // Inicio de evento de clic en el botón "Editar comportamiento"
        fireEvent.click(screen.getByText('Editar comportamiento'));

        // Verificar que el modal se abrio en modo edición
        expect(screen.getByText('Editar Comportamiento')).toBeInTheDocument();
        
        // Verificar que el nombre del comportamiento se precargó en el input
        expect(screen.getByDisplayValue('Ofensivo')).toBeInTheDocument();
    });
});