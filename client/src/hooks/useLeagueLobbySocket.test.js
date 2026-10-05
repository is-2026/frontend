import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { useLeagueLobbySocket } from "./useLeagueLobbySocket";

// mock de react-router-dom con funciones de Vitest
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

// mock de la API de WebSocket
class MockWebSocket {
    static instances = [];

    constructor(url) {
        this.url = url;
        this.onmessage = null;
        this.onerror = null;
        this.close = vi.fn();
        MockWebSocket.instances.push(this);
    }

    // método auxiliar para simular que el servidor nos envía un mensaje
    sendMessage(data) {
        if (this.onmessage) {
            this.onmessage({ data: JSON.stringify(data) });
        }
    }
}

describe("useLeagueLobbySocket Hook", () => {
    let mockSetLeague;
    let mockSetError;

    beforeEach(() => {
        vi.clearAllMocks();
        MockWebSocket.instances = [];
        global.WebSocket = MockWebSocket;

        mockSetLeague = vi.fn();
        mockSetError = vi.fn();
    });

    test("no inicia la conexión si no se pasa leagueId", () => {
        renderHook(() => useLeagueLobbySocket(null, mockSetLeague, mockSetError));
        expect(MockWebSocket.instances.length).toBe(0);
    });

    test("se conecta a la URL correcta del WebSocket", () => {
        const leagueId = "123";
        renderHook(() => useLeagueLobbySocket(leagueId, mockSetLeague, mockSetError));

        expect(MockWebSocket.instances.length).toBe(1);
        expect(MockWebSocket.instances[0].url).toContain(`/ws/leagues/${leagueId}/lobby`);
    });

    test("maneja el evento 'clubRegistered' agregando el nuevo club", () => {
        renderHook(() => useLeagueLobbySocket("123", mockSetLeague, mockSetError));
        const socket = MockWebSocket.instances[0];

        // simulamos mensaje del servidor
        act(() => {
            socket.sendMessage({
                type: "clubRegistered",
                data: { club_id: "10", club_name: "Boca" },
            });
        });

        expect(mockSetLeague).toHaveBeenCalledTimes(1);

        // validamos la función actualizadora de estado
        const updaterFn = mockSetLeague.mock.calls[0][0];
        const statePrevio = { registered_clubs: [{ club_id: "1", club_name: "River" }] };
        const nuevoEstado = updaterFn(statePrevio);

        expect(nuevoEstado.registered_clubs).toHaveLength(2);
        expect(nuevoEstado.registered_clubs[1]).toEqual({ club_id: "10", club_name: "Boca" });
    });

    test("maneja el evento 'clubLeft' eliminando al club", () => {
        renderHook(() => useLeagueLobbySocket("123", mockSetLeague, mockSetError));
        const socket = MockWebSocket.instances[0];

        act(() => {
            socket.sendMessage({
                type: "clubLeft",
                data: { club_id: "10" },
            });
        });

        expect(mockSetLeague).toHaveBeenCalledTimes(1);

        const updaterFn = mockSetLeague.mock.calls[0][0];
        const statePrevio = {
            registered_clubs: [
                { club_id: "10", club_name: "Boca" },
                { club_id: "20", club_name: "River" },
            ],
        };
        const nuevoEstado = updaterFn(statePrevio);

        expect(nuevoEstado.registered_clubs).toHaveLength(1);
        expect(nuevoEstado.registered_clubs[0].club_id).toBe("20");
    });

    test("redirecciona a la liga cuando llega el evento 'leagueStarted'", () => {
        const leagueId = "999";
        renderHook(() => useLeagueLobbySocket(leagueId, mockSetLeague, mockSetError));
        const socket = MockWebSocket.instances[0];

        act(() => {
            socket.sendMessage({ type: "leagueStarted" });
        });

        expect(mockNavigate).toHaveBeenCalledWith(`/leagues/${leagueId}`);
    });

    test("muestra el mensaje de error si llega el evento 'leagueCancelled'", () => {
        renderHook(() => useLeagueLobbySocket("123", mockSetLeague, mockSetError));
        const socket = MockWebSocket.instances[0];

        act(() => {
            socket.sendMessage({ type: "leagueCancelled" });
        });

        expect(mockSetError).toHaveBeenCalledWith("La liga fue cancelada por el creador.");
    });

    test("cierra la conexión del WebSocket al desmontar el componente", () => {
        const { unmount } = renderHook(() =>
            useLeagueLobbySocket("123", mockSetLeague, mockSetError)
        );
        const socket = MockWebSocket.instances[0];

        unmount();

        expect(socket.close).toHaveBeenCalledTimes(1);
    });
});