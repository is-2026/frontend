import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LobbyPage } from './LobbyPage';
import { useInitFriendlySocket } from '../hooks/useInitFriendlySocket';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ friendlyId: '123' })
    };
});

vi.mock('../hooks/useInitFriendlySocket', () => ({
    useInitFriendlySocket: vi.fn()
}));

describe('LobbyPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Verifica el flujo: mantiene la espera y redirige automáticamente al recibir el matchId', () => {
        useInitFriendlySocket.mockReturnValue({ matchId: null });

        const { rerender } = render(
            <MemoryRouter>
                <LobbyPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Esperando rival...')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();

        useInitFriendlySocket.mockReturnValue({ matchId: 'match-999' });

        rerender(
            <MemoryRouter>
                <LobbyPage />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/match/match-999');
    });

    test('Muestra el rival y los segundos que faltan según starts_at', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));
        useInitFriendlySocket.mockReturnValue({
            matchId: null,
            rival: { id: 'club-2', name: 'Chacarita' },
            startsAt: new Date('2026-10-05T12:00:27Z'),
        });

        render(
            <MemoryRouter>
                <LobbyPage />
            </MemoryRouter>
        );

        expect(screen.getByText('vs Chacarita')).toBeInTheDocument();
        expect(screen.getByText('27')).toBeInTheDocument();
        vi.useRealTimers();
    });

    test('Cuando llega a cero muestra que está arrancando', () => {
        useInitFriendlySocket.mockReturnValue({
            matchId: null,
            rival: { id: 'club-2', name: 'Chacarita' },
            startsAt: new Date(Date.now() - 1000), // ya pasó
        });

        render(
            <MemoryRouter>
                <LobbyPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Arrancando...')).toBeInTheDocument();
    });
});