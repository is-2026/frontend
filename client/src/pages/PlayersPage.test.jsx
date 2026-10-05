import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, vi, beforeEach } from "vitest";
import { PlayersPage } from "./PlayersPage";
import * as clubService from "../services/club";

// mock para los services de club
vi.mock("../services/club", () => ({
    getPlayers: vi.fn(),
}));

const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("PlayersPage Component", () => {
    // limpiamos llamadas e historial de los mocks antes de cada test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("muestra el indicador de carga inicialmente", () => {
        vi.spyOn(clubService, "getPlayers").mockImplementation(
            () => new Promise(() => {}),
        );

        renderWithRouter(<PlayersPage />);
        expect(
            screen.getByText("Cargando plantilla del equipo..."),
        ).toBeInTheDocument();
    });

    test("muestra un mensaje si la plantilla esta vacía", async () => {
        // simulamos que la plantilla esta vacía, la API responde con exito pero no trae jugadores.
        vi.spyOn(clubService, "getPlayers").mockResolvedValueOnce([]);

        renderWithRouter(<PlayersPage />);

        await waitFor(() => {
            expect(
                screen.getByText(/aún no tenés jugadores/i),
            ).toBeInTheDocument();
        });
    });

    test("muestra mensaje de error si la API falla", async () => {
        // simulamos una falla en el servidor HTTP
        vi.spyOn(clubService, "getPlayers").mockRejectedValueOnce(
            new Error("Error 500: Error interno del servidor."),
        );
        renderWithRouter(<PlayersPage />);

        await waitFor(() => {
            expect(
                screen.getByText(/Error 500: Error interno del servidor/i),
            ).toBeInTheDocument();
        });
    });

    test("renderiza la lista de los jugadores creados y suma PACSS correctamente", async () => {
        // preparamos un jugador de preuba con sus estadisticas conocidas
        const mockPlayers = [
            {
                id: "1",
                name: "Fernando Cavenaghi",
                number: 9,
                power: 80,
                agility: 60,
                control: 70,
                speed: 35,
                strength: 55,
            },
        ];

        vi.spyOn(clubService, "getPlayers").mockResolvedValueOnce(mockPlayers);

        renderWithRouter(<PlayersPage />);

        // esperamos a que los datos del jugador se dibujen en la tabla
        await waitFor(() => {
            expect(screen.getByText("Fernando Cavenaghi")).toBeInTheDocument();
            expect(screen.getByText("#9")).toBeInTheDocument();
        });
        // validamos la logica de negocio, la suma debe ser de 300.
        expect(screen.getByText("300 pts")).toBeInTheDocument();
    });
});
