import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LeagueLobbyPage } from "./LeagueLobbyPage";
import { getLeague } from "../services/leagues";
import { useLeagueLobbySocket } from "../hooks/useLeagueLobbySocket";

// mock del servicio de leagues
vi.mock("../services/leagues", () => ({
    getLeague: vi.fn(),
}));

// mock del hook de WebSockets
vi.mock("../hooks/useLeagueLobbySocket", () => ({
    useLeagueLobbySocket: vi.fn(),
}));

describe("LeagueLobbyPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // helper para renderizar con react router y el parametro de url
    const renderWithRouter = (leagueId = "123") => {
        return render(
            <MemoryRouter initialEntries={[`/leagues/${leagueId}/lobby`]}>
                <Routes>
                    <Route path="/leagues/:leagueId/lobby" element={<LeagueLobbyPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    test("muestra el estado de carga inicialmente", () => {
        getLeague.mockImplementation(() => new Promise(() => {}));

        renderWithRouter("123");

        expect(screen.getByText(/cargando lobby de la liga.../i)).toBeInTheDocument();
    });

    test("renderiza el nombre de la liga, el contador de los clubes que hay y clubes inscriptos exitosamente", async () => {
        const mockLeague = {
            id: "123",
            name: "Liga del ChiquiMafia",
            max_clubs: 30,
            registered_clubs: [
                { club_id: "c1", club_name: "River Plate" },
                { club_id: "c2", club_name: "Voke" },
                { club_id: "c3", club_name: "Centro Social Las Higueras" },
                { club_id: "c4", club_name: "Platense" },
                { club_id: "c5", club_name: "Atenas de Rio Cuarto" },
            ],
        };

        getLeague.mockResolvedValueOnce(mockLeague);
        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("Liga del ChiquiMafia")).toBeInTheDocument();
        });

        expect(getLeague).toHaveBeenCalledWith("123");
        expect(screen.getByText("5 / 30")).toBeInTheDocument();
        expect(screen.getByText("River Plate")).toBeInTheDocument();
        expect(screen.getByText("Voke")).toBeInTheDocument();
        expect(screen.getByText("Centro Social Las Higueras")).toBeInTheDocument();
        expect(screen.getByText("Platense")).toBeInTheDocument();
        expect(screen.getByText("Atenas de Rio Cuarto")).toBeInTheDocument();
    });

    test("muestra mensaje de error informativo cuando no hay clubes registrados", async () => {
        const mockLeague = {
            id: "123",
            name: "Liga Vacía",
            max_clubs: 4,
            registered_clubs: [],
        };
        getLeague.mockResolvedValueOnce(mockLeague);

        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("Liga Vacía")).toBeInTheDocument();
        });

        expect(screen.getByText("0 / 4")).toBeInTheDocument();
        expect(
            screen.getByText("Aún no hay clubes inscriptos en esta liga.")
        ).toBeInTheDocument();
    });

    test("muestra un mensaje de error si falla la petición HTTP", async () => {
        getLeague.mockRejectedValueOnce(new Error("No se pudo obtener la liga."));

        renderWithRouter("123");
        
        await waitFor(() => {
            expect(screen.getByText("No se pudo obtener la liga.")).toBeInTheDocument();
        });
    });

    test("invoca el hook 'useLeagueLobbySocket' con los argumentos correctos", () => {
        getLeague.mockResolvedValueOnce({
            id: "123",
            name: "Liga Test Socket",
            max_clubs: 4,
            registered_clubs: [],
        });

        renderWithRouter("123");

        expect(useLeagueLobbySocket).toHaveBeenCalledWith(
            "123",
            expect.any(Function),
            expect.any(Function)
        );
    });
});