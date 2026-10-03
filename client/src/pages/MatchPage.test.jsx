import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MatchPage from './MatchPage';
import useMatchSocket from '../hooks/useMatchSocket';

vi.mock('../hooks/useMatchSocket', () => ({
    default: vi.fn()
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
            ball_position: { x: 500, y: 250 },
            players: [
                { player_id: 'p1', position: { x: 100, y: 100 } }, 
                { player_id: 'p3', position: { x: 900, y: 400 } }  
            ]
        });

        const { container } = render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:partidoId" element={<MatchPage />} />
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
        expect(homePlayers[0]).toHaveStyle({ left: '100px', top: '100px' });

        // Jugador rojo tiene que ser p3, verificar posición 900x400.
        expect(awayPlayers[0]).toHaveStyle({ left: '900px', top: '400px' });

        // 3. VERIFICACIÓN DE LA PELOTA
        const ball = container.querySelector('.bg-white.rounded-full.border-black');
        expect(ball).toBeInTheDocument();
        expect(ball).toHaveStyle({ left: '500px', top: '250px' });
    });
});