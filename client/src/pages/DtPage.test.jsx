import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DtPage } from './DtPage';
import * as behaviorsService from '../services/behaviors';
import * as clubService from '../services/club';

vi.mock('../services/behaviors', () => ({
    getBehaviors: vi.fn(),
    deleteBehavior: vi.fn(),
}));

vi.mock('../services/club', () => ({
    getMyClub: vi.fn(),
    updateDtBehavior: vi.fn(),
}));

const mockData = [
    { id: 'p1', name: 'Jugador Ofensivo', code: 'attack()', kind: 'player' },
    { id: 'd1', name: 'DT Defensivo', code: 'def decide_coach(): pass', kind: 'coach' },
    { id: 'd2', name: 'DT Ofensivo', code: 'def decide_coach(): pass', kind: 'coach' },
];

const renderPage = () => render(<MemoryRouter><DtPage /></MemoryRouter>);

describe('DtPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        behaviorsService.getBehaviors.mockResolvedValue(mockData);
    });

    test('1. muestra solo los comportamientos de tipo DT', async () => {
        clubService.getMyClub.mockResolvedValue({ coach_behavior_id: null });
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('DT Defensivo')).toBeInTheDocument();
            expect(screen.getByText('DT Ofensivo')).toBeInTheDocument();
        });
        expect(screen.queryByText('Jugador Ofensivo')).not.toBeInTheDocument();
    });

    test('2. muestra el DT actual según coach_behavior_id', async () => {
        clubService.getMyClub.mockResolvedValue({ coach_behavior_id: 'd2' });
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Comportamiento asignado: DT Ofensivo')).toBeInTheDocument();
        });
    });

    test('3. muestra Ninguno si el club no tiene DT', async () => {
        clubService.getMyClub.mockResolvedValue({ coach_behavior_id: null });
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Comportamiento asignado: Ninguno')).toBeInTheDocument();
        });
    });

    test('4. al asignar un DT muestra "Rige desde el próximo partido"', async () => {
        clubService.getMyClub.mockResolvedValue({ coach_behavior_id: null });
        clubService.updateDtBehavior.mockResolvedValue({});
        renderPage();

        const buttons = await screen.findAllByText('Asignar al DT');
        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(clubService.updateDtBehavior).toHaveBeenCalledWith('d1');
            expect(screen.getByText('Rige desde el próximo partido')).toBeInTheDocument();
        });
    });

    test('5. Quitar DT envía null', async () => {
        clubService.getMyClub.mockResolvedValue({ coach_behavior_id: 'd1' });
        clubService.updateDtBehavior.mockResolvedValue({});
        renderPage();

        fireEvent.click(await screen.findByText('Quitar DT'));

        await waitFor(() => {
            expect(clubService.updateDtBehavior).toHaveBeenCalledWith(null);
        });
    });

    test('6. muestra el error si el back rechaza el DT (400)', async () => {
        clubService.getMyClub.mockResolvedValue({ coach_behavior_id: null });
        const error = new Error('El comportamiento es de jugador');
        error.status = 400;
        clubService.updateDtBehavior.mockRejectedValue(error);
        renderPage();

        const buttons = await screen.findAllByText('Asignar al DT');
        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(screen.getByText('El comportamiento es de jugador')).toBeInTheDocument();
        });
    });
});