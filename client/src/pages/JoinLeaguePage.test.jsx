import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { JoinLeaguePage } from "./JoinLeaguePage";
import { getLeagues, getLeagueById, joinLeague } from "../services/leagues";
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
        getLeagueById.mockResolvedValue({ id: "league-123", is_private: false });
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

    test("1. debe unirse exitosamente y redirigir al lobby (/leagues/league-123/lobby)", async () => {
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

    test("2. Debe mostrar 'Liga no encontrada' si la API no devuelve la liga", async () => {
        getLeagueById.mockResolvedValue(null);
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

    test("3. debe solicitar contraseña si la liga es privada e ingresar con la clave correcta", async () => {
    getLeagueById.mockResolvedValue({ id: "league-123", is_private: true });
    getPlayers.mockResolvedValue([{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }, { id: "p5" }, { id: "p6" }]);
    getBehaviors.mockResolvedValue([{ id: "b1" }, { id: "b2" }, { id: "b3" }]);

    renderPage();

    // 1. Verificar que renderiza el campo de contraseña por ser privada
    await waitFor(() => {
        expect(screen.getByPlaceholderText(/contraseña de la liga/i)).toBeInTheDocument();
    });

    // 2. Simular selección de alineación
    fireEvent.click(screen.getByTestId("mock-select-btn"));

    const inputPass = screen.getByPlaceholderText(/contraseña de la liga/i);
    const submitBtn = screen.getByRole("button", { name: /confirmar e inscribirse/i });

    // Sin ingresar la contraseña el botón permanece deshabilitado
    expect(submitBtn).toBeDisabled();

    // 3. Intento con contraseña errónea (simulando respuesta 400 de la API)
    fireEvent.change(inputPass, { target: { value: "incorrecta" } });
    expect(submitBtn).not.toBeDisabled();

    joinLeague.mockRejectedValueOnce({ status: 400, message: "La contraseña es incorrecta." });
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(screen.getByText(/la contraseña es incorrecta/i)).toBeInTheDocument();
    });

    // 4. Intento con contraseña correcta (envía clave a la API y redirige)
    fireEvent.change(inputPass, { target: { value: "secretpass" } });
    joinLeague.mockResolvedValueOnce({ success: true });
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(joinLeague).toHaveBeenCalledWith(
            "league-123",
            expect.objectContaining({ password: "secretpass" })
        );
        expect(mockNavigate).toHaveBeenCalledWith("/leagues/league-123/lobby");
    });
});

    test("4. Debe enviar el formulario de inscripción y redirigir al lobby (/leagues/league-123/lobby)", async () => {
        getLeagueById.mockResolvedValue({ id: "league-123", is_private: false });
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
            expect(mockNavigate).toHaveBeenCalledWith("/leagues/league-123/lobby");
        });
    });

    test("5. Debe mostrar un mensaje de error si falla la API", async () => {
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

    test("6. Debe pedir el detalle de la liga con getLeagueById (no con el buscador) y pedir la contraseña si es privada", async () => {
        // getLeagues ahora es el buscador por nombre y devuelve un array:
        // si la página lo usara para el detalle, is_private quedaría undefined
        getLeagues.mockResolvedValue([{ id: "league-123", is_private: true }]);
        getLeagueById.mockResolvedValue({ id: "league-123", is_private: true });
        joinLeague.mockResolvedValue({ success: true });

        renderPage();

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/contraseña de la liga/i)).toBeInTheDocument();
        });

        expect(getLeagueById).toHaveBeenCalledWith("league-123");
        expect(getLeagues).not.toHaveBeenCalled();

        fireEvent.click(screen.getByTestId("mock-select-btn"));
        fireEvent.change(screen.getByPlaceholderText(/contraseña de la liga/i), {
            target: { value: "secretpass" },
        });
        fireEvent.click(screen.getByRole("button", { name: /confirmar e inscribirse/i }));

        await waitFor(() => {
            expect(joinLeague).toHaveBeenCalledWith(
                "league-123",
                expect.objectContaining({ password: "secretpass" })
            );
        });
    });
});