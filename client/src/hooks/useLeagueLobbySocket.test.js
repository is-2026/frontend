import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { useLeagueLobbySocket } from "./useLeagueLobbySocket";

// mock de react-router-dom con funciones de Vitest
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

// mock de config para controlar la URL del WebSocket
vi.mock("../config", () => {
    const WS_URL = "ws://localhost:8000";
    const LEAGUE_LOBBY_WS_PATH = (id) => `/ws/leagues/${id}/lobby`;
    return {
        WS_URL,
        LEAGUE_LOBBY_WS_PATH,
        wsUrl: (path) => `${WS_URL}${path}?token=${encodeURIComponent(localStorage.getItem("token") ?? "")}`,
    };
});

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
        localStorage.setItem("token", "test-token-123");
        MockWebSocket.instances = [];
        global.WebSocket = MockWebSocket;

        mockSetLeague = vi.fn();
        mockSetError = vi.fn();
    });

    test("no inicia la conexión si no se pasa leagueId", () => {
        renderHook(() => useLeagueLobbySocket(null, mockSetLeague, mockSetError));
        expect(MockWebSocket.instances.length).toBe(0);
    });

    test("se conecta al backend con la URL y el token correctos", () => {
        renderHook(() => useLeagueLobbySocket("123", mockSetLeague, mockSetError));

        expect(MockWebSocket.instances.length).toBe(1);
        expect(MockWebSocket.instances[0].url).toBe("ws://localhost:8000/ws/leagues/123/lobby?token=test-token-123");
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

    test("maneja el evento 'leagueStarted' marcando la liga como iniciada", () => {
        renderHook(() => useLeagueLobbySocket("123", mockSetLeague, mockSetError));
        const socket = MockWebSocket.instances[0];

        act(() => {
            socket.sendMessage({ type: "leagueStarted" });
        });

        expect(mockSetLeague).toHaveBeenCalledTimes(1);

        const updaterFn = mockSetLeague.mock.calls[0][0];
        const statePrevio = { id: "123", name: "Liga Test", registered_clubs: [] };
        const nuevoEstado = updaterFn(statePrevio);

        expect(nuevoEstado.is_started).toBe(true);
        expect(nuevoEstado.status).toBe("started");
    });
});