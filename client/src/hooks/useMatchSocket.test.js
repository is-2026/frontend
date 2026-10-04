import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMatchSocket } from './useMatchSocket';

vi.mock('../config', () => ({
    WS_URL: 'ws://localhost:8080',
    MATCH_WS_PATH: (id) => `/ws/matches/${id}`
}));

describe('useMatchSocket', () => {
    let mockWebSocketInstance;

    beforeEach(() => {
        mockWebSocketInstance = {
            addEventListener: vi.fn(),
            close: vi.fn(),
            readyState: 1,
        };
        
        global.WebSocket = vi.fn(function() {
            return mockWebSocketInstance;
        });
        
        global.WebSocket.OPEN = 1;
        global.WebSocket.CONNECTING = 0;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('1. Retorna nulos y no abre conexión si matchId no existe', () => {
        const { result } = renderHook(() => useMatchSocket(null));
        
        expect(global.WebSocket).not.toHaveBeenCalled();
        expect(result.current.lineups).toBeNull();
        expect(result.current.scores).toBeNull();
        expect(result.current.state).toBeNull();
    });

    test('2. Instancia el WebSocket con la URL correcta', () => {
        renderHook(() => useMatchSocket('123'));
        
        expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080/ws/matches/123');
        expect(mockWebSocketInstance.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    test('3. Procesa el evento "matchStarted" y actualiza alineaciones y puntajes', () => {
        const { result } = renderHook(() => useMatchSocket('123'));
        
        const messageCallback = mockWebSocketInstance.addEventListener.mock.calls.find(
            (call) => call[0] === 'message'
        )[1];

        act(() => {
            messageCallback({
                data: JSON.stringify({
                    type: 'matchStarted',
                    data: {
                        home_lineup: [{ player_id: 'p1' }],
                        away_lineup: [{ player_id: 'p2' }],
                        home_score: 0,
                        away_score: 0
                    }
                })
            });
        });

        expect(result.current.lineups).toEqual({
            home: [{ player_id: 'p1' }],
            away: [{ player_id: 'p2' }]
        });
        expect(result.current.scores).toEqual({ home: 0, away: 0 });
    });

    test('4. Procesa el evento "matchState" y actualiza posiciones en cada tick', () => {
        const { result } = renderHook(() => useMatchSocket('123'));
        
        const messageCallback = mockWebSocketInstance.addEventListener.mock.calls.find(
            (call) => call[0] === 'message'
        )[1];

        act(() => {
            messageCallback({
                data: JSON.stringify({
                    type: 'matchState', //match_id, tick, players, ball_position
                    data: {
                        match_id: '123',
                        tick: 4,
                        players: [{ player_id: 'p1', position: { x: 4, y: 4 }}],
                        ball_position: { x: 20, y: 10 }
                    }
                })
            });
        });

        expect(result.current.state.ballPosition).toEqual({ x: 20, y: 10 });
        expect(result.current.state.players).toEqual([{ playerId: 'p1', x: 4, y: 4 }]);
        expect(result.current.state.matchId).toEqual('123');
        expect(result.current.state.tick).toEqual(4);
    });

    test('5. Cierra el WebSocket correctamente al desmontar el componente', () => {
        const { unmount } = renderHook(() => useMatchSocket('123'));
        
        unmount();
        
        expect(mockWebSocketInstance.close).toHaveBeenCalledTimes(1);
    });

});