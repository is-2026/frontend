import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BehaviorDetail from './BehaviorDetail';
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
});