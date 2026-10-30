import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { LeagueLineupPage } from "./LeagueLineupPage";
import { getLineup, updateLineup } from "../services/leagues";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";

// mocks de servicios
vi.mock("../services/leagues");
vi.mock("../services/club");
vi.mock("../services/behaviors");

// mock selector de jugadores: muestra los nombres que recibe y simula una seleccion incompleta
vi.mock("../components/PlayerSelection", () => ({
    PlayerSelection: ({ availablePlayers, onChange }) => (
        <div>
            {availablePlayers.map((p) => (
                <span key={p.id}>{p.name}</span>
            ))}
            <button
                data-testid="mock-incomplete-btn"
                onClick={() =>
                    onChange({
                        starters: [
                            { player_id: "p1", behavior_id: "b1" },
                            { player_id: "p2", behavior_id: "b2" },
                        ],
                        substitutes: ["p4", "p5", "p6"],
                    })
                }
            >
                Simular Selección Incompleta
            </button>
        </div>
    ),
}));

// mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ leagueId: "league-123" }),
    };
});

describe("LeagueLineupPage", () => {
    const mockLineup = {
        formation: "OFFENSIVE_LINE",
        players: [
            { player_id: "p1", is_starter: true, behavior_id: "b1" },
            { player_id: "p2", is_starter: true, behavior_id: "b2" },
            { player_id: "p3", is_starter: true, behavior_id: "b3" },
            { player_id: "p4", is_starter: false },
            { player_id: "p5", is_starter: false },
            { player_id: "p6", is_starter: false },
        ],
    };

    const mockPlayers = [
        { id: "p1", name: "Messi" },
        { id: "p2", name: "Dibu" },
        { id: "p3", name: "Otamendi" },
        { id: "p4", name: "Di Maria" },
        { id: "p5", name: "Paredes" },
        { id: "p6", name: "Molina" },
        { id: "p7", name: "No Convocado" },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        getLineup.mockResolvedValue(mockLineup);
        getPlayers.mockResolvedValue(mockPlayers);
        getBehaviors.mockResolvedValue([{ id: "b1" }, { id: "b2" }, { id: "b3" }]);
    });

    const renderPage = () =>
        render(
            <MemoryRouter initialEntries={["/leagues/league-123/lineup"]}>
                <Routes>
                    <Route path="/leagues/:leagueId/lineup" element={<LeagueLineupPage />} />
                </Routes>
            </MemoryRouter>
        );

    test("muestra el estado de carga inicialmente", () => {
        getLineup.mockImplementation(() => new Promise(() => {}));

        renderPage();

        expect(screen.getByText(/cargando alineación.../i)).toBeInTheDocument();
    });

    test("carga la alineación vigente: formación y solo los jugadores convocados", async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/mi alineación/i)).toBeInTheDocument();
        });

        expect(getLineup).toHaveBeenCalledWith("league-123");
        expect(screen.getByRole("combobox")).toHaveValue("OFFENSIVE_LINE");
        expect(screen.getByText("Messi")).toBeInTheDocument();
        expect(screen.getByText("Molina")).toBeInTheDocument();
        expect(screen.queryByText("No Convocado")).not.toBeInTheDocument();
    });

    test("muestra un error y permite volver a la liga si falla la carga", async () => {
        getLineup.mockRejectedValue({ message: "Error al cargar la alineación." });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/error al cargar la alineación/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /volver a la liga/i }));
        expect(mockNavigate).toHaveBeenCalledWith("/leagues/league-123/lobby");
    });

    test("el botón volver redirige al lobby de la liga", async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/mi alineación/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /volver a la liga/i }));
        expect(mockNavigate).toHaveBeenCalledWith("/leagues/league-123/lobby");
    });

    test("guarda la alineación con la formación y los jugadores correctos", async () => {
        updateLineup.mockResolvedValue({ success: true });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/mi alineación/i)).toBeInTheDocument();
        });

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "TRIANGLE" } });

        const saveBtn = screen.getByRole("button", { name: /guardar/i });
        expect(saveBtn).not.toBeDisabled();
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(updateLineup).toHaveBeenCalledWith("league-123", {
                formation: "TRIANGLE",
                players: [
                    { player_id: "p1", is_starter: true, behavior_id: "b1" },
                    { player_id: "p2", is_starter: true, behavior_id: "b2" },
                    { player_id: "p3", is_starter: true, behavior_id: "b3" },
                    { player_id: "p4", is_starter: false },
                    { player_id: "p5", is_starter: false },
                    { player_id: "p6", is_starter: false },
                ],
            });
            expect(screen.getByText(/rige desde el próximo partido/i)).toBeInTheDocument();
        });
    });

    test("deshabilita el botón guardar si la selección está incompleta", async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/mi alineación/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId("mock-incomplete-btn"));

        expect(screen.getByRole("button", { name: /guardar/i })).toBeDisabled();
    });

    test("muestra el mensaje del servidor si falla con 409", async () => {
        updateLineup.mockRejectedValue({ status: 409, message: "Ya empezó el partido." });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/mi alineación/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

        await waitFor(() => {
            expect(screen.getByText(/ya empezó el partido/i)).toBeInTheDocument();
            expect(screen.queryByText(/rige desde el próximo partido/i)).not.toBeInTheDocument();
        });
    });

    test("muestra un mensaje genérico si falla con un error inesperado", async () => {
        updateLineup.mockRejectedValue({ status: 500, message: "boom" });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/mi alineación/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

        await waitFor(() => {
            expect(screen.getByText(/ocurrió un error inesperado al guardar la alineación/i)).toBeInTheDocument();
        });
    });
});