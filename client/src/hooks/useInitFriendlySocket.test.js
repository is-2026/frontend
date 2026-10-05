import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInitFriendlySocket } from './useInitFriendlySocket';

vi.mock('../config', () => ({
    WS_URL: 'ws://localhost:8080',
    FRIENDLY_LOBBY_WS_PATH: (id) => `/ws/friendlies/${id}/lobby`
}));

describe('useInitFriendlySocket', () => {
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

    test('1. Retorna null y no abre conexión si friendlyId no existe', () => {
        const { result } = renderHook(() => useInitFriendlySocket(null));

        expect(global.WebSocket).not.toHaveBeenCalled();
        expect(result.current.matchId).toBeNull();
    });

    test('2. Instancia el WebSocket con la URL correcta', () => {
        renderHook(() => useInitFriendlySocket('456'));

        expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080/ws/friendlies/456/lobby');
        expect(mockWebSocketInstance.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    test('3. Procesa el evento "friendlyStart", actualiza el estado y cierra la conexión', () => {
        const { result } = renderHook(() => useInitFriendlySocket('456'));

        const messageCallback = mockWebSocketInstance.addEventListener.mock.calls.find(
            (call) => call[0] === 'message'
        )[1];

        act(() => {
            messageCallback({
                data: JSON.stringify({
                    type: 'friendlyStart',
                    data: {
                        match_id: 'match-999'
                    }
                })
            });
        });

        expect(result.current.matchId).toBe('match-999');
        expect(mockWebSocketInstance.close).toHaveBeenCalledTimes(1);
    });

    test('4. Cierra el WebSocket correctamente al desmontar el componente', () => {
        const { unmount } = renderHook(() => useInitFriendlySocket('456'));

        unmount();

        expect(mockWebSocketInstance.close).toHaveBeenCalledTimes(1);
    });
});