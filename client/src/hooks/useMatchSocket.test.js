import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMatchSocket } from './useMatchSocket';
import { useMatch } from 'react-router-dom';

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

        global.WebSocket = vi.fn(function () {
            return mockWebSocketInstance;
        });

        global.WebSocket.OPEN = 1;
        global.WebSocket.CONNECTING = 0;
    });

    afterEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    function setupHook() {
        const { result } = renderHook(() => useMatchSocket('123'));
        const messageCallback = mockWebSocketInstance.addEventListener.mock.calls.find(
            (call) => call[0] == 'message' 
        )[1]; //Esto extrae el segundo elemento, que sería lo que devuelve el eventListener de 'message'
              //Es decir, los case de los distintos mensages
        function send(type, data) { //simula mensage emitido por sv del ws hacia el cliente
            act(() => {
                messageCallback({ data: JSON.stringify({ type, data }) });
            });
        }
        return {result, send};
    }

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
                        players: [{ player_id: 'p1', position: { x: 4, y: 4 } }],
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

    test.each([
        [
            'coolingBreakStart', 
            { cooling_break_number: 1, cooling_break_start: 't', ends_at: 'e' }, 
            { type: 'cooling_break_1', endsAt: 'e' }
        ],

        [
            'coolingBreakStart', 
            { cooling_break_number: 2, cooling_break_start: 't', ends_at: 'e' }, 
            { type: 'cooling_break_2', endsAt: 'e' }
        ],
        [
            'halftimeStart', 
            { halftime_start: 't', ends_at: 'e' }, 
            { type: 'halftime', endsAt: 'e' }
        ],
    ])('8. "%s" activa la pausa correspondiente', (type, data, expected) => { 
        //type es el string, data es el tipo e inicio de pausa,
        //expected son los datos que devuelve el ws de esa pausa.
        const { result, send } = setupHook();
        expect(result.current.pause).toBeNull();

        send(type, data);

        expect(result.current.pause).toEqual(expected); //acá debería estar la respuesta del ws con los datos de pause,
                                                        //que sería el 3er elemento de cada arreglo
    });

    test('9. "matchResumed" termina la pausa y suma 1 al contador', () => {
        const { result, send } = setupHook();
        expect(result.current.pausesEnded).toBe(0);

        send('halftimeStart', { halftime_start: 't' });
        expect(result.current.pause).not.toBeNull();
        
        send('matchResumed', {});
        expect(result.current.pause).toBeNull();
        expect(result.current.pausesEnded).toBe(1);

        send('coolingBreakStart', { cooling_break_number: 2, cooling_break_start: 't' });
        expect(result.current.pause).not.toBeNull();
        send('matchResumed', {});
        expect(result.current.pausesEnded).toBe(2);
    });

    test('10. "SubstitutionMade" realiza el cambio del titular por suplente con su comportamiento, sin modificar al otro club', ()  =>{
        const { result, send } = setupHook();

        send('matchStarted', {
            home_lineup: [{player_id: 'h1', is_starter:true}],
            away_lineup: [
                { player_id: 'a1', is_starter: true, behavior_id: 'b1', behavior_name: 'Atacante'},
                { player_id: 'a2', is_starter: false},
            ]
        });
        const oldHome = result.current.lineups.home;

        send('substitutionMade', {player_in_id: 'a2', player_out_id: 'a1', behavior_id: 'b2', behavior_name: 'Defensor'});
        const[leaving, entering] = result.current.lineups.away;
        expect(leaving.is_starter).toBe(false);
        expect(entering).toEqual({ player_id: 'a2', is_starter: true, behavior_id: 'b2', behavior_name: 'Defensor' });
        expect(result.current.lineups.home).toBe(oldHome); // verifica que no se modifique home
    });

    test('11. "PenaltyShootoutStart": trae ends_at y marca el inicio de los penales con isOn', ()  =>{
        const { result, send } = setupHook();

        expect(result.current.penaltyStart).toBeNull();

        send('PenaltyShootoutStart', { ends_at: 'end'});

        expect(result.current.penaltyStart.endsAt).toBe('end');
        expect(result.current.penaltyStart.isOn).toBe(true);
    });

    test('12. "PenaltyResultData": trae los stats hasta ahora y si el último penal fue gol y de qué equipo fue', ()  =>{
        const { result, send } = setupHook();

        expect(result.current.penaltyResult).toBeNull();

        send('PenaltyResultData', { 
            team_id: 'tid',
            scored: true,
            home_penalties: 4,
            away_penalties: 3,
            number: 9
        });

        expect(result.current.penaltyResult.teamId).toBe('tid');
        expect(result.current.penaltyResult.scored).toBe(true);
        expect(result.current.penaltyResult.homePenalties).toBe(4);
        expect(result.current.penaltyResult.awayPenalties).toBe(3);
        expect(result.current.penaltyResult.number).toBe(9);
    });

    test('13. "PenaltyKick": trae que equipo y jugador patea, quién ataja y el numero de penal', ()  =>{
        const { result, send } = setupHook();

        expect(result.current.penaltyKick).toBeNull();

        send('PenaltyKick', { 
            kicker_id: 'kid',
            defender_id: 'did',
            team_id: 'tid',
            number: 9
        });

        expect(result.current.penaltyKick.kickerId).toBe('kid');
        expect(result.current.penaltyKick.defenderId).toBe('did');
        expect(result.current.penaltyKick.teamId).toBe('tid');
        expect(result.current.penaltyKick.number).toBe(9);
    });


});