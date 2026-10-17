import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMatchSocket } from './useMatchSocket';

vi.mock('../config', () => {
    const WS_URL = 'ws://localhost:8000';
    const MATCH_WS_PATH = (id) => `/ws/matches/${id}`;
    return {
        WS_URL,
        MATCH_WS_PATH,
        wsUrl: (path) => `${WS_URL}${path}?token=${encodeURIComponent(localStorage.getItem('token') ?? '')}`,
    };
});
describe('useMatchSocket', () => {
    let mockWebSocketInstance;

    beforeEach(() => {

        localStorage.setItem('token', 'test-token-123');

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
        localStorage.clear();
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
        
        expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8000/ws/matches/123?token=test-token-123');
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

    test('6. Procesar el evento "goal"', () => {
        const { result } = renderHook(() => useMatchSocket("123"));

        const messageCallback =
            mockWebSocketInstance.addEventListener.mock.calls.find(
                (call) => call[0] === "message",
            )[1];

        act(() => {
            messageCallback({
                data: JSON.stringify({
                    type: "matchStarted",
                    data: {
                        home_lineup: [{ player_id: "p1" }],
                        away_lineup: [{ player_id: "p2" }],
                        home_score: 0,
                        away_score: 0,
                        home_club: { id: "club-h", name: "River" },
                        away_club: { id: "club-a", name: "Chacarita" },

                    },
                }),
            });
        });
        //gol home
        act(() => {
            messageCallback({
                data: JSON.stringify({
                    type: "goal",
                    data: {
                        player_id: "p1",
                        team_id: "club-h",
                        minute: 2,
                        tick: 120,
                        home_score: 1,
                        away_score: 0,

                    },
                }),
            });
        });
        
        expect(result.current.scores).toEqual({ home: 1, away: 0 });
        expect(result.current.goalInfo).toEqual({
            tick: 120,
            minute: 2,
            playerId: "p1",
            team: "home",
            teamName: 'River',
        });
    });

    test('7. Procesa el evento "behaviorChanged" y actualiza solo al jugador indicado', () => {
        const { result } = renderHook(() => useMatchSocket('123'));

        const messageCallback = mockWebSocketInstance.addEventListener.mock.calls.find(
            (call) => call[0] === 'message'
        )[1];

        act(() => {
            messageCallback({
                data: JSON.stringify({
                    type: 'matchStarted',
                    data: {
                        home_lineup: [
                            { player_id: 'p1', behavior_id: 'b1', behavior_name: 'Atacante' },
                            { player_id: 'p2', behavior_id: 'b1', behavior_name: 'Atacante' },
                        ],
                        away_lineup: [
                            { player_id: 'p3', behavior_id: 'b1', behavior_name: 'Atacante' },
                        ],
                        home_score: 0,
                        away_score: 0,
                    },
                }),
            });
        });

        act(() => {
            messageCallback({
                data: JSON.stringify({
                    type: 'behaviorChanged',
                    data: { player_id: 'p1', behavior_id: 'b2', behavior_name: 'Defensor' },
                }),
            });
        });

        expect(result.current.lineups.home[0]).toEqual({
            player_id: 'p1', behavior_id: 'b2', behavior_name: 'Defensor',
        });
        // los demás jugadores no cambian
        expect(result.current.lineups.home[1].behavior_id).toBe('b1');
        expect(result.current.lineups.away[0].behavior_id).toBe('b1');
    });

});