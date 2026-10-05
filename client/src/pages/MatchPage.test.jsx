import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MatchPage } from './MatchPage';
import { useMatchSocket } from '../hooks/useMatchSocket';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../config';
import { toPercent } from "../components/match/Field";

vi.mock('../hooks/useMatchSocket', () => ({
    useMatchSocket: vi.fn()
}));

describe('MatchPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renderiza la interfaz completa, la cancha y asigna colores estrictos cruzando ID y coordenadas', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }], 
                away: [{ player_id: 'p3' }]  
            },
            scores: { home: 0, away: 0 },
            state: {
                matchId: 1,
                tick: 2,
                players: [
                    { playerId: 'p1', x: 4, y: 4 }, 
                    { playerId: 'p3', x: 36, y: 16 }  
                ],
                ballPosition: { x: 20, y: 10 }
            }
        });

        const { container } = render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        // 1. VERIFICACIÓN DEL HEADER Y PANELES
        expect(screen.getByText('Equipo Local')).toBeInTheDocument();
        expect(screen.getByText('Equipo Rival')).toBeInTheDocument();
        expect(screen.getByText('00:00')).toBeInTheDocument();
        
        expect(screen.getByText('Equipo')).toBeInTheDocument();
        expect(screen.getByText('Suplentes')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /realizar cambios/i })).toBeInTheDocument();

        // 2. VERIFICACIÓN DE JUGADORES (Renderizado de color correcto)
        const homePlayers = container.querySelectorAll('.bg-blue-500');
        const awayPlayers = container.querySelectorAll('.bg-red-500');

        expect(homePlayers.length).toBe(1);
        expect(awayPlayers.length).toBe(1);

        // Jugador azul tiene que ser p1, verificar posición 100x100.
        expect(homePlayers[0]).toHaveStyle({ 
            left: toPercent(4,0,FIELD_WIDTH),
            top: toPercent(4,0,FIELD_HEIGHT) 
        });

        // Jugador rojo tiene que ser p3, verificar posición 900x400.
        expect(awayPlayers[0]).toHaveStyle({ 
            left: toPercent(36,0,FIELD_WIDTH),
            top: toPercent(16,0,FIELD_HEIGHT) 
        });

        // 3. VERIFICACIÓN DE LA PELOTA
        const ball = screen.getByTestId('ball');
        expect(ball).toBeInTheDocument();
        expect(ball).toHaveStyle({ 
            left: toPercent(20,0,FIELD_WIDTH), 
            top: toPercent(10,0,FIELD_HEIGHT)
        });
    });
    test('ajusta automáticamente con stayInBounds a los jugadores que están fuera de la cancha', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }], // Local -> Azul
                away: [{ player_id: 'p2' }]  // Visitante -> Rojo
            },
            scores: { home: 0, away: 0 },
            state: {
                matchId: 1,
                tick: 1,
                players: [
                    // Jugador fuera por la izquierda y arriba
                    { playerId: 'p1', x: -10, y: -5 },
                    // Jugador fuera por la derecha y abajo
                    { playerId: 'p2', x: 100, y: 50 }
                ],
                ballPosition: { x: -20, y: 50 }
            }
        });
    });

    test('stayInBounds mantiene a los jugadores y la pelota dentro de la cancha', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }], 
                away: [{ player_id: 'p2' }]  
            },
            scores: { home: 0, away: 0 },
            state: {
                matchId: 1,
                tick: 1,
                players: [
                    // Jugador fuera por la izquierda y arriba
                    { playerId: 'p1', x: -10, y: -5 },
                    // Jugador fuera por la derecha y abajo
                    { playerId: 'p2', x: 100, y: 50 }
                ],
                ballPosition: { x: 200, y: -10 }
            }
        });

    });
});