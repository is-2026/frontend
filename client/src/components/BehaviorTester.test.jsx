import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { BehaviorTester } from './BehaviorTester';
import { useMatchSocket } from '../hooks/useMatchSocket';

vi.mock('../hooks/useMatchSocket', () => ({
    useMatchSocket: vi.fn(),
}));

const teams = { home: { id: 'h', name: 'Prueba' }, away: { id: 'a', name: 'Marcador' } };
const state = { tick: 300, players: [], ballPosition: { x: 0, y: 0 } };

describe('BehaviorTester', () => {
    test('1. se conecta al partido de prueba con el match_id recibido', () => {
        useMatchSocket.mockReturnValue({ teams, scores: { home: 0, away: 0 }, state, lineups: null, goalInfo: null, finished: null });

        render(<BehaviorTester behaviorId="m1" setTestLayout={vi.fn()} />);

        expect(useMatchSocket).toHaveBeenCalledWith('m1');
    });

    test('2. muestra la cancha, el reloj y el marcador', () => {
        useMatchSocket.mockReturnValue({ teams, scores: { home: 1, away: 0 }, state, lineups: null, goalInfo: null, finished: null });

        render(<BehaviorTester behaviorId="m1" setTestLayout={vi.fn()} />);

        expect(screen.getByTestId('field')).toBeInTheDocument();
        expect(screen.getByText('00:30')).toBeInTheDocument(); // 300 ticks = 30 segundos
        expect(screen.getByText('Prueba')).toBeInTheDocument();
        expect(screen.getByText('Marcador')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('3. al terminar muestra el resultado y la opción para volver', () => {
        useMatchSocket.mockReturnValue({
            teams, scores: { home: 2, away: 0 }, state, lineups: null, goalInfo: null,
            finished: { tick: 600, homeScore: 2, awayScore: 0 },
        });
        const setTestLayout = vi.fn();

        render(<BehaviorTester behaviorId="m1" setTestLayout={setTestLayout} />);

        expect(screen.getByText('PARTIDO FINALIZADO')).toBeInTheDocument();
        expect(screen.getByText('Ganó Prueba')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Volver a amistosos'));
        expect(setTestLayout).toHaveBeenCalledWith(false);
    });

    test('4. el botón Cerrar Prueba cierra el panel', () => {
        useMatchSocket.mockReturnValue({ teams, scores: { home: 0, away: 0 }, state, lineups: null, goalInfo: null, finished: null });
        const setTestLayout = vi.fn();

        render(<BehaviorTester behaviorId="m1" setTestLayout={setTestLayout} />);

        fireEvent.click(screen.getByText('Cerrar Prueba'));
        expect(setTestLayout).toHaveBeenCalledWith(false);
    });
});