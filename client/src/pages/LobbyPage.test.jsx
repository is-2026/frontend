import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LobbyPage from './LobbyPage';
import useInitFriendlySocket from '../hooks/useInitFriendlySocket';

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
    default: vi.fn()
}));

describe('LobbyPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Verifica el flujo: mantiene la espera y redirige automáticamente al recibir el partidoId', () => {
        useInitFriendlySocket.mockReturnValue({ partidoId: null });

        const { rerender } = render(
            <MemoryRouter>
                <LobbyPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Esperando para iniciar el partido...')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();

        useInitFriendlySocket.mockReturnValue({ partidoId: 'match-999' });

        rerender(
            <MemoryRouter>
                <LobbyPage />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/partido/match-999');
    });
});