import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { LeagueLobbyPage } from "./LeagueLobbyPage";
import { getLeague, getLeagues, leaveLeague, startLeague } from "../services/leagues";
import { useLeagueLobbySocket } from "../hooks/useLeagueLobbySocket";
import { getMyClub } from "../services/club";

// mock completo del servicio de leagues
vi.mock("../services/leagues", () => ({
    getLeague: vi.fn(),
    getLeagues: vi.fn(),
    getLeagueById: vi.fn(),
    createLeagues: vi.fn(),
    joinLeague: vi.fn(),
    leaveLeague: vi.fn(),
    startLeague: vi.fn(),
}));

// mock del hook de WebSockets
vi.mock("../hooks/useLeagueLobbySocket", () => ({
    useLeagueLobbySocket: vi.fn(),
}));

// mock del servicio de club (para saber si soy el creador)
vi.mock("../services/club", () => ({
    getMyClub: vi.fn(),
}));

describe("LeagueLobbyPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getMyClub.mockResolvedValue({ id: "club-1" }); // mi club
    });

    // helper para renderizar con React Router y el parámetro de URL
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
        getLeagues.mockImplementation(() => new Promise(() => {}));

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
        getLeagues.mockResolvedValueOnce(mockLeague);

        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("Liga del ChiquiMafia")).toBeInTheDocument();
        });

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
        getLeagues.mockResolvedValueOnce(mockLeague);

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
        getLeagues.mockRejectedValueOnce(new Error("No se pudo obtener la liga."));

        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("No se pudo obtener la liga.")).toBeInTheDocument();
        });
    });

    test("invoca el hook 'useLeagueLobbySocket' con los argumentos correctos", () => {
        const mockLeague = {
            id: "123",
            name: "Liga Test Socket",
            max_clubs: 4,
            registered_clubs: [],
        };

        getLeague.mockResolvedValueOnce(mockLeague);
        getLeagues.mockResolvedValueOnce(mockLeague);

        renderWithRouter("123");

        expect(useLeagueLobbySocket).toHaveBeenCalledWith(
            "123",
            expect.any(Function),
            expect.any(Function)
        );
    });

    test("muestra un mensaje de error si falla al intentar abandonar la liga", async () => {
        getLeagues.mockResolvedValueOnce({
            id: "123",
            name: "Liga Test",
            max_clubs: 10,
            registered_clubs: [],
        });
        
        leaveLeague.mockRejectedValueOnce(new Error("La liga indicada no existe, o el club no está inscripto en ella"));

        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("Liga Test")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Abandonar Liga"));

        await waitFor(() => {
            expect(screen.getByText("Ocurrió un error al intentar abandonar la liga.")).toBeInTheDocument();
        });
    });

    test("no muestra el botón de iniciar liga si el usuario no es el creador", async () => {
        getLeagues.mockResolvedValueOnce({
            id: "123",
            name: "Liga Test",
            max_clubs: 10,
            creator_club_id: "club-2",
            registered_clubs: [
                { club_id: "c1", club_name: "Club 1" },
                { club_id: "c2", club_name: "Club 2" },
                { club_id: "c3", club_name: "Club 3" },
            ],
        });

        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("Liga Test")).toBeInTheDocument();
        });

        expect(screen.queryByRole("button", { name: /iniciar liga/i })).not.toBeInTheDocument();
    });

    test("muestra el botón deshabilitado y advertencia si hay menos de 3 clubes inscriptos", async () => {
        getLeagues.mockResolvedValueOnce({
            id: "123",
            name: "Liga Test",
            max_clubs: 10,
            creator_club_id: "club-1",
            registered_clubs: [
                { club_id: "c1", club_name: "Club 1" },
                { club_id: "c2", club_name: "Club 2" },
            ],
        });

        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("Liga Test")).toBeInTheDocument();
        });

        const startButton = screen.getByRole("button", { name: /iniciar liga/i });
        expect(startButton).toBeDisabled();
        expect(
            screen.getByText("Se necesitan al menos 3 clubes inscriptos para poder iniciar la liga.")
        ).toBeInTheDocument();
    });

    test("abre el modal de confirmación al hacer clic en 'Iniciar liga'", async () => {
        getLeagues.mockResolvedValueOnce({
            id: "123",
            name: "Liga Test",
            max_clubs: 10,
            creator_club_id: "club-1",
            registered_clubs: [
                { club_id: "c1", club_name: "Club 1" },
                { club_id: "c2", club_name: "Club 2" },
                { club_id: "c3", club_name: "Club 3" },
            ],
        });

        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("Liga Test")).toBeInTheDocument();
        });

        const startButton = screen.getByRole("button", { name: /iniciar liga/i });
        fireEvent.click(startButton);

        expect(screen.getByText("Confirmar inicio de liga")).toBeInTheDocument();
        expect(
            screen.getByText("¿Estás seguro de que deseas iniciar la liga? Una vez iniciada no podrán unirse más clubes.")
        ).toBeInTheDocument();
    });

    test("inicia la liga correctamente al confirmar en el modal", async () => {
        getLeagues.mockResolvedValueOnce({
            id: "123",
            name: "Liga Test",
            max_clubs: 10,
            creator_club_id: "club-1",
            registered_clubs: [
                { club_id: "c1", club_name: "Club 1" },
                { club_id: "c2", club_name: "Club 2" },
                { club_id: "c3", club_name: "Club 3" },
            ],
        });

        startLeague.mockResolvedValueOnce({ id: "123", status: "started", is_started: true });

        renderWithRouter("123");

        await waitFor(() => {
            expect(screen.getByText("Liga Test")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /iniciar liga/i }));
        fireEvent.click(screen.getByRole("button", { name: /confirmar e iniciar/i }));

        await waitFor(() => {
            expect(startLeague).toHaveBeenCalledWith("123");
            expect(screen.queryByRole("button", { name: /iniciar liga/i })).not.toBeInTheDocument();
        });
    });
});