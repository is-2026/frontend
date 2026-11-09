import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { JoinLeaguePage } from "./JoinLeaguePage";
import { getLeagues, joinLeague } from "../services/leagues";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";

// mocks de servicios
vi.mock("../services/leagues");
vi.mock("../services/club");
vi.mock("../services/behaviors");

// mock selector de jugadores
vi.mock("../components/PlayerSelection", () => ({
    PlayerSelection: ({ onChange }) => (
        <button
            data-testid="mock-select-btn"
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
            Simular Selección
        </button>
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

describe("JoinLeaguePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getLeagues.mockResolvedValue({ id: "league-123", is_private: false });
        getPlayers.mockResolvedValue([]);
        getBehaviors.mockResolvedValue([]);
    });

    const renderPage = () =>
        render(
            <MemoryRouter initialEntries={["/leagues/league-123/join"]}>
                <Routes>
                    <Route path="/leagues/:leagueId/join" element={<JoinLeaguePage />} />
                </Routes>
            </MemoryRouter>
        );

    test("debe unirse exitosamente y redirigir al lobby (/leagues/league-123/lobby)", async () => {
        joinLeague.mockResolvedValue({ success: true });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/alineación para la liga/i)).toBeInTheDocument();
        });

        // simular seleccion y confirmar
        fireEvent.click(screen.getByTestId("mock-select-btn"));
        fireEvent.click(screen.getByRole("button", { name: /confirmar e inscribirse/i }));

        await waitFor(() => {
            expect(joinLeague).toHaveBeenCalledWith("league-123", expect.any(Object));
            expect(mockNavigate).toHaveBeenCalledWith("/leagues/league-123/lobby");
        });
    });

    test("debe mostrar 'Liga no encontrada' si la API no devuelve la liga", async () => {
        getLeagues.mockResolvedValue(null);
        getPlayers.mockResolvedValue([]);
        getBehaviors.mockResolvedValue([]);

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/liga no encontrada/i)).toBeInTheDocument();
        });

        const backButton = screen.getByRole("button", { name: /volver a ver ligas/i });
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith("/leagues");
    });

    test("en una liga privada pide la contraseña en el formulario y la envía", async () => {
        getLeagues.mockResolvedValue({ id: "league-123" , is_private: true });
        joinLeague.mockResolvedValue({ success: true });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/alineación para la liga/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId("mock-select-btn"));
        const confirmBtn = screen.getByRole("button", { name: /confirmar e inscribirse/i });

        // sin contraseña no se puede confirmar
        expect(confirmBtn).toBeDisabled();

        fireEvent.change(screen.getByPlaceholderText(/contraseña de la liga/i), {
            target: { value: "contrasecreta" },
        });

        expect(confirmBtn).not.toBeDisabled();

        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(joinLeague).toHaveBeenCalledWith( "league-123", expect.objectContaining({ password: "contrasecreta"}));
            expect(mockNavigate).toHaveBeenCalledWith("/leagues/league-123/lobby");
        });
    });

    test("muestra mensajes de error ante un 400 o un 404", async () => {
        getLeagues.mockResolvedValue({ id: "league-123", is_private: true });
        joinLeague
            .mockRejectedValueOnce({ status: 400, message: "Contraseña incorrecta" })
            .mockRejectedValueOnce({ status: 404 });
        
        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/alineación para la liga/i)).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText(/contraseña de la liga/i), {
            target: { value: "mala" },
        });
        fireEvent.click(screen.getByTestId("mock-select-btn"));
        const confirmBtn = screen.getByRole("button", { name: /confirmar e inscribirse/i });
        
        // error 400, contra incorrecta, se muestra el msj del back
        fireEvent.click(confirmBtn);
        await waitFor(() => {
            expect(screen.getByText(/contraseña incorrecta/i)).toBeInTheDocument();
        });

        // error 404, liga no existe, se muestra el msj del back
        fireEvent.click(confirmBtn);
        await waitFor(() => {
            expect(screen.getByText(/la liga no existe/i)).toBeInTheDocument();
        });

        expect(mockNavigate).not.toHaveBeenCalledWith("/leagues/league-123/lobby");
    });

    test("debe enviar el formulario de inscripción y redirigir al lobby (/leagues/league-123/lobby)", async () => {
        getLeagues.mockResolvedValue({ id: "league-123", is_private: false });
        getPlayers.mockResolvedValue([{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }, { id: "p5" }, { id: "p6" }]);
        getBehaviors.mockResolvedValue([{ id: "b1" }, { id: "b2" }, { id: "b3" }]);
        joinLeague.mockResolvedValue({ success: true });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/alineación para la liga/i)).toBeInTheDocument();
        });

        // simular seleccion de alineacion mediante nuestro mock
        const simulateBtn = screen.getByTestId("mock-select-btn");
        fireEvent.click(simulateBtn);

        const confirmBtn = screen.getByRole("button", { name: /confirmar e inscribirse/i });
        expect(confirmBtn).not.toBeDisabled();

        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(joinLeague).toHaveBeenCalledWith("league-123", {
                players: [
                    { player_id: "p1", is_starter: true, behavior_id: "b1" },
                    { player_id: "p2", is_starter: true, behavior_id: "b2" },
                    { player_id: "p3", is_starter: true, behavior_id: "b3" },
                    { player_id: "p4", is_starter: false },
                    { player_id: "p5", is_starter: false },
                    { player_id: "p6", is_starter: false },
                ],
            });
            expect(mockNavigate).toHaveBeenCalledWith("/leagues/league-123/lobby");
        });
    });

    test("debe mostrar un mensaje de error si falla la API", async () => {
        joinLeague.mockRejectedValue({ status: 409 });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/alineación para la liga/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId("mock-select-btn"));
        fireEvent.click(screen.getByRole("button", { name: /confirmar e inscribirse/i }));

        await waitFor(() => {
            expect(screen.getByText(/tu club ya está inscripto en esta liga/i)).toBeInTheDocument();
            expect(mockNavigate).not.toHaveBeenCalledWith("/leagues/league-123/lobby");
        });
    });
});