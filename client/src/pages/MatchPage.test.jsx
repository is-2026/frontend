import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MatchPage } from './MatchPage';
import { useMatchSocket } from '../hooks/useMatchSocket';
import { getPlayers } from '../services/club';

vi.mock('../hooks/useMatchSocket', () => ({
    useMatchSocket: vi.fn()
}));

vi.mock('../services/club', () => ({
    getPlayers: vi.fn().mockResolvedValue([])
}));

describe('MatchPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('1. El inicio del partido renderiza la interfaz completa, la cancha, jugadores y pelota', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }], 
                away: [{ player_id: 'p3' }]  
            },
            scores: { home: 0, away: 0 },
            state: {
                matchId: '123',
                tick: 0,
                players: [
                    { playerId: 'p1', x: -10, y: -5 }, 
                    { playerId: 'p3', x: 10, y: 5 }  
                ],
                ballPosition: { x: 0, y: 0 }
            },
            goalInfo: null,
            finished: { matchEnd: false }
        });

        const { container } = render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Verificación de Header y Paneles
        expect(screen.getByText('Equipo Local')).toBeInTheDocument();
        expect(screen.getByText('Equipo Rival')).toBeInTheDocument();
        expect(screen.getByText('00:00')).toBeInTheDocument();
        expect(screen.getByText('Equipo')).toBeInTheDocument();
        expect(screen.getByText('Suplentes')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /realizar cambios/i })).toBeInTheDocument();

        // Verificación de los jugadores por sus clases de color (bg-blue-500 y bg-red-500)
        const homePlayers = container.querySelectorAll('.bg-blue-500');
        const awayPlayers = container.querySelectorAll('.bg-red-500');

        expect(homePlayers.length).toBe(1);
        expect(awayPlayers.length).toBe(1);

        // Verificación de la Pelota
        expect(screen.getByTestId('ball')).toBeInTheDocument();
    });

    test('2. Renderiza correctamente el banner de gol cuando goalInfo no es null', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }], 
                away: [{ player_id: 'p2' }]  
            },
            scores: { home: 1, away: 0 },
            state: {
                matchId: '123',
                tick: 120,
                players: [{ playerId: 'p1', x: 0, y: 0 }],
                ballPosition: { x: 20, y: 0 }
            },
            goalInfo: {
                tick: 120,
                minute: 2,
                playerId: 'p1',
                team: 'home'
            },
            finished: { matchEnd: false }
        });

        render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('¡GOL!')).toBeInTheDocument();
        expect(screen.getByText("Equipo Local - minuto 2'")).toBeInTheDocument();
    });

    test('3. Muestra el resultado final y banner al finalizar el partido (finished.matchEnd = true)', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }], 
                away: [{ player_id: 'p2' }]  
            },
            scores: { home: 2, away: 1 },
            state: {
                matchId: '123',
                tick: 5400,
                players: [],
                ballPosition: { x: 0, y: 0 }
            },
            goalInfo: null,
            finished: {
                matchEnd: true,
                homeScore: 2,
                awayScore: 1
            }
    });

    render(
        <MemoryRouter initialEntries={['/match/123']}>
            <Routes>
                <Route path="/match/:matchId" element={<MatchPage />} />
            </Routes>
        </MemoryRouter>
    );

    // Verifica el título del banner
    expect(screen.getByText(/PARTIDO FINALIZADO/i)).toBeInTheDocument();

    // Busca el texto "2 - 1"
    expect(screen.getByText('Equipo Local 2 - 1 Equipo Rival')).toBeInTheDocument();
});

    test('4. Tolera coordenadas fuera de rango en la simulación sin romper el componente', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }],
                away: [{ player_id: 'p2' }]
            },
            scores: { home: 0, away: 0 },
            state: {
                matchId: '123',
                tick: 10,
                players: [
                    { playerId: 'p1', x: -50, y: -30 },
                    { playerId: 'p2', x: 50, y: 30 }
                ],
                ballPosition: { x: 100, y: -50 }
            },
            goalInfo: null,
            finished: { matchEnd: false }
        });

        const { container } = render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(container.querySelectorAll('.bg-blue-500').length).toBe(1);
        expect(container.querySelectorAll('.bg-red-500').length).toBe(1);
        expect(screen.getByTestId('ball')).toBeInTheDocument();
    });

    test('5. Actualiza los marcadores en el header al convertir un gol', () => {
        const { rerender } = render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Estado inicial del marcador: 0 - 0
        useMatchSocket.mockReturnValue({
            lineups: { home: [{ player_id: 'p1' }], away: [{ player_id: 'p2' }] },
            scores: { home: 0, away: 0 },
            state: { matchId: '123', tick: 0, players: [], ballPosition: { x: 0, y: 0 } },
            goalInfo: null,
            finished: { matchEnd: false }
        });

        rerender(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        const score0Elements = screen.getAllByText('0');
        expect(score0Elements.length).toBeGreaterThanOrEqual(2); // Local 0 y Visitante 0

        // Simulación del evento de Gol del equipo local: pasa a 1 - 0
        useMatchSocket.mockReturnValue({
            lineups: { home: [{ player_id: 'p1' }], away: [{ player_id: 'p2' }] },
            scores: { home: 1, away: 0 },
            state: { matchId: '123', tick: 300, players: [], ballPosition: { x: 20, y: 0 } },
            goalInfo: { tick: 300, minute: 5, playerId: 'p1', team: 'home' },
            finished: { matchEnd: false }
        });

        rerender(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Verifica que el nuevo valor '1' se muestre en pantalla
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('6. Los paneles muestran mi equipo (aunque sea el visitante) y cada ficha tiene su número', async () => {
        const lineup = (prefix, firstNumber) => [
            { player_id: `${prefix}1`, number: firstNumber, name: `${prefix}-tit-1`, is_starter: true, behavior_name: 'Atacante' },
            { player_id: `${prefix}2`, number: firstNumber + 1, name: `${prefix}-tit-2`, is_starter: true, behavior_name: 'Defensor' },
            { player_id: `${prefix}3`, number: firstNumber + 2, name: `${prefix}-sup-1`, is_starter: false },
        ];
        useMatchSocket.mockReturnValue({
            teams: { home: { id: 'h', name: 'Local' }, away: { id: 'a', name: 'Visita' } },
            lineups: { home: lineup('h', 1), away: lineup('a', 7) },
            scores: { home: 0, away: 0 },
            state: { matchId: '123', tick: 0, players: [{ playerId: 'a1', x: 5, y: 0 }], ballPosition: { x: 0, y: 0 } },
            goalInfo: null,
            finished: null,
        });
        // mis jugadores son los del visitante
        getPlayers.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]);

        render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText('a-tit-1')).toBeInTheDocument();
        expect(screen.getByText('a-tit-2')).toBeInTheDocument();
        expect(screen.getByText('Atacante')).toBeInTheDocument();
        expect(screen.getByText('a-sup-1')).toBeInTheDocument();
        expect(screen.queryByText('h-tit-1')).not.toBeInTheDocument();
        // la ficha del jugador a1 muestra su número
        expect(screen.getByTestId('player-a1')).toHaveTextContent('7');
    });
});