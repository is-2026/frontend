import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CreateFriendlyPage from "./CreateFriendlyPage";
import { createFriendlies } from "../services/friendlies";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";

// mock de las funciones API
vi.mock("../services/friendlies", () => ({
    createFriendlies: vi.fn(),
}));

vi.mock("../services/club", () => ({
    getPlayers: vi.fn(),
}));

vi.mock("../services/behaviors", () => ({
    getBehaviors: vi.fn(),
}));

// mock de react-router-dom para capturar la navegación
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// mock del componente playerselection para facilitar la simulacion de selección
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
}));

describe("CreateFriendlyPage", () => {
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
                <CreateFriendlyPage />
            </MemoryRouter>,
        );

        // debe mostrar cargando
        expect(screen.getByText("Cargando datos...")).toBeInTheDocument();

        // esperar a que se carguen los datos
        await waitFor(() => {
            expect(
                screen.getByText("Crear partido amistoso"),
            ).toBeInTheDocument();
        });

        expect(getPlayers).toHaveBeenCalledTimes(1);
        expect(getBehaviors).toHaveBeenCalledTimes(1);
    });

    test("muestra mensaje de error si falla la carga inicial de datos", async () => {
        getPlayers.mockRejectedValueOnce(new Error("Error de red"));

        render(
            <MemoryRouter>
                <CreateFriendlyPage />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Error al cargar los jugadores y comportamientos de tu club.",
                ),
            ).toBeInTheDocument();
        });
    });

    test("mantiene el botón de confirmar deshabilitado si la alineación no es válida", async () => {
        render(
            <MemoryRouter>
                <CreateFriendlyPage />
            </MemoryRouter>,
        );
        await waitFor(() => {
            expect(
                screen.getByText("Crear partido amistoso"),
            ).toBeInTheDocument();
        });
        const submitButton = screen.getByRole("button", {
            name: "Confirmar y Crear Amistoso",
        });
        expect(submitButton).toBeDisabled();
    });

    test("mantiene el botón de confirmar deshabilitado si la alineación no es válida", async () => {
        render(
            <MemoryRouter>
                <CreateFriendlyPage />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Crear partido amistoso"),
            ).toBeInTheDocument();
        });

        // simular selección válida mediante el mock
        fireEvent.click(screen.getByTestId("select-valid-team"));

        const submitButton = screen.getByRole("button", {
            name: "Confirmar y Crear Amistoso",
        });
        expect(submitButton).not.toBeDisabled();

        // completar campo opcional de contraseña
        const passwordInput = screen.getByPlaceholderText(
            "Dejar en blanco para amistoso público",
        );
        fireEvent.change(passwordInput, { target: { value: "secreto123" } });

        // enviar formulario
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(createFriendlies).toHaveBeenCalledWith({
                password: "secreto123",
                match_duration_minutes: 5,
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
        // verificamos la redirección al lobby con el ID retornado
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/friendlies");
        });
    });

    test("muetra mensaje de error cuando la creación del amistoso falla (Error 404)", async () => {
        const errorResponse = new Error(
            "El club ya cuenta con un partido activo.",
        );
        errorResponse.status = 400;
        createFriendlies.mockRejectedValueOnce(errorResponse);

        render(
            <MemoryRouter>
                <CreateFriendlyPage />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Crear partido amistoso"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId("select-valid-team"));
        fireEvent.click(
            screen.getByRole("button", { name: "Confirmar y Crear Amistoso" }),
        );

        await waitFor(() => {
            expect(
                screen.getByText("El club ya cuenta con un partido activo."),
            ).toBeInTheDocument();
        });
    });
});
