import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CreateLeaguePage } from "./CreateLeaguePage";
import { createLeagues } from "../services/leagues";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";

vi.mock("../services/leagues", () => ({
    createLeagues: vi.fn(),
}));

vi.mock("../services/club", () => ({
    getPlayers: vi.fn(),
}));

vi.mock("../services/behaviors", () => ({
    getBehaviors: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../components/PlayerSelection", () => ({
    default: ({ onChange }) => (
        <div data-testid="mock-player-selection">
            <button
                type="button"
                data-testid="select-valid-team"
                onClick={() =>
                    onChange({
                        starters: [
                            { player_id: "p1", behavior_id: "b1" },
                            { player_id: "p2", behavior_id: "b2" },
                            { player_id: "p3", behavior_id: "b3" },
                        ],
                        substitutes: ["p4", "p5", "p6"],
                    })
                }
            >
                Seleccionar alineación válida
            </button>
        </div>
    ),
    PlayerSelection: ({ onChange }) => (
        <div data-testid="mock-player-selection">
            <button
                type="button"
                data-testid="select-valid-team"
                onClick={() =>
                    onChange({
                        starters: [
                            { player_id: "p1", behavior_id: "b1" },
                            { player_id: "p2", behavior_id: "b2" },
                            { player_id: "p3", behavior_id: "b3" },
                        ],
                        substitutes: ["p4", "p5", "p6"],
                    })
                }
            >
                Seleccionar alineación válida
            </button>
        </div>
    )
}));

describe("CreateLeaguePage", () => {
    const mockPlayers = [
        { id: "p1", name: "Jugador 1" },
        { id: "p2", name: "Jugador 2" },
    ];
    const mockBehaviors = [{ id: "b1", name: "Ofensivo" }];

    beforeEach(() => {
        vi.clearAllMocks();
        getPlayers.mockResolvedValue(mockPlayers);
        getBehaviors.mockResolvedValue(mockBehaviors);
    });

    test("muestra el estado de carga inicialmente y luego renderiza el formulario", async () => {
        render(
            <MemoryRouter>
                <CreateLeaguePage />
            </MemoryRouter>
        );

        expect(screen.getByText("Cargando datos...")).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText("Crear liga")).toBeInTheDocument();
        });

        expect(getPlayers).toHaveBeenCalledTimes(1);
        expect(getBehaviors).toHaveBeenCalledTimes(1);
    });

    test("muestra mensaje de error si falla la carga inicial de datos", async () => {
        getPlayers.mockRejectedValueOnce(new Error("Error de red"));

        render(
            <MemoryRouter>
                <CreateLeaguePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText("Error al cargar los jugadores y comportamientos de tu club.")
            ).toBeInTheDocument();
        });
    });

    test("mantiene el botón de confirmar deshabilitado si faltan datos obligatorios o la alineación no es válida", async () => {        
        render(
            <MemoryRouter>
                <CreateLeaguePage />
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(screen.getByText("Crear liga")).toBeInTheDocument();
        });
        
        const submitButton = screen.getByRole("button", { name: "Confirmar y Crear Liga" });
        expect(submitButton).toBeDisabled();
    });

    test("habilita el botón, envía el payload correcto y redirige al lobby exitosamente", async () => {
        createLeagues.mockResolvedValueOnce({ id: "liga-123" });

        render(
            <MemoryRouter>
                <CreateLeaguePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Crear liga")).toBeInTheDocument();
        });

        // 1. Simular selección de equipo válida
        fireEvent.click(screen.getByTestId("select-valid-team"));

        // 2. Completar campos obligatorios faltantes (el nombre inicializa vacío)
        const nameInput = screen.getByLabelText("Nombre de la liga");
        fireEvent.change(nameInput, { target: { value: "Copa Libertadores" } });

        // 3. Completar campos modificables (maxClubs empieza en 8)
        const maxClubsInput = screen.getByLabelText("Cantidad máxima de clubs");
        fireEvent.change(maxClubsInput, { target: { value: "16" } });

        // 4. Completar campo opcional
        const passwordInput = screen.getByLabelText("Contraseña (Opcional)");
        fireEvent.change(passwordInput, { target: { value: "secreto123" } });

        const submitButton = screen.getByRole("button", { name: "Confirmar y Crear Liga" });
        expect(submitButton).not.toBeDisabled();

        // Enviar formulario
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(createLeagues).toHaveBeenCalledWith({
                name: "Copa Libertadores",
                password: "secreto123",
                max_clubs: 16,
                match_duration_minutes: 5,
                allows_draws: false, // añado esta linea, para manadar el payload correcto
                players: [
                    { player_id: "p1", is_starter: true, behavior_id: "b1" },
                    { player_id: "p2", is_starter: true, behavior_id: "b2" },
                    { player_id: "p3", is_starter: true, behavior_id: "b3" },
                    { player_id: "p4", is_starter: false },
                    { player_id: "p5", is_starter: false },
                    { player_id: "p6", is_starter: false },
                ],
            });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/leagues/liga-123/lobby");
        });
    });

    test("muestra mensaje de error cuando la creación de la liga falla (Error 400)", async () => {
        const errorResponse = new Error("El club ya pertenece a una liga activa.");
        errorResponse.status = 400;
        createLeagues.mockRejectedValueOnce(errorResponse);

        render(
            <MemoryRouter>
                <CreateLeaguePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Crear liga")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId("select-valid-team"));
        
        const nameInput = screen.getByLabelText("Nombre de la liga");
        fireEvent.change(nameInput, { target: { value: "Liga Test Error" } });

        fireEvent.click(screen.getByRole("button", { name: "Confirmar y Crear Liga" }));

        await waitFor(() => {
            expect(screen.getByText("El club ya pertenece a una liga activa.")).toBeInTheDocument();
        });
    });

    test("envía allows_draws en true cuando se marca la casilla sin empates", async () => {
        createLeagues.mockResolvedValueOnce({ id: "liga-123" });

        render(
            <MemoryRouter>
                <CreateLeaguePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Crear liga")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId("select-valid-team"));
        fireEvent.change(screen.getByLabelText("Nombre de la liga"), { target: { value: "Liga sin empates" } });
        fireEvent.click(screen.getByLabelText("Sin empates"));

        fireEvent.click(screen.getByRole("button", { name: "Confirmar y Crear Liga" }));

        await waitFor(() => {
            expect(createLeagues).toHaveBeenCalledTimes(
                expect.objectContaining({ allows_draws: true });
            );
        });
    });
});