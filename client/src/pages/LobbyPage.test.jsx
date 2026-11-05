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

    test('Muestra el rival, sin cuenta regresiva', () => {
        useInitFriendlySocket.mockReturnValue({
            matchId: null,
            rival: { id: 'club-2', name: 'Chacarita' },
        });

        render(
            <MemoryRouter>
                <LobbyPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Vas a jugar contra Chacarita')).toBeInTheDocument();
        expect(screen.getByText('Arrancando el partido...')).toBeInTheDocument();
    });
});