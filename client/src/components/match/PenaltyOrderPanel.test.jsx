import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { PenaltyOrderPanel } from "./PenaltyOrderPanel";
import { setPenaltyOrder } from "../../services/matches";

vi.mock("../../services/matches", () => ({
    setPenaltyOrder: vi.fn(),
}));

describe("PenaltyOrderPanel", () => {
    const mockPlayers = [
        { player_id: "p1", number: 10, name: "Messi" },
        { player_id: "p2", number: 7, name: "Ronaldo" },
        { player_id: "p3", number: 9, name: "Suárez" },
        { player_id: "p4", number: 11, name: "Neymar" },
        { player_id: "p5", number: 8, name: "Iniesta" },
        { player_id: "p6", number: 6, name: "Xavi" },
    ];

    const mockBehaviors = [
        { id: "b1", name: "Atacante", kind: "player" },
        { id: "b2", name: "Defensor", kind: "player" },
        { id: "b3", name: "Estrategia Global", kind: "team" }, // No debe aparecer
    ];

    const futureEndsAt = new Date(Date.now() + 15000).toISOString();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("1. Renderiza interfaz con 5 slots de pateadores", () => {
        render(
            <PenaltyOrderPanel
                matchId="123"
                players={mockPlayers}
                behaviors={mockBehaviors}
                endsAt={futureEndsAt}
            />
        );

        expect(screen.getByText(/Orden de penales/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Pateador/i)).toHaveLength(5);
        expect(screen.getByRole("button", { name: /Confirmar elección/i })).toBeDisabled();
    });

    test("2. Filtra los comportamientos del club y sólo muestra los comportamientos de jugadores", () => {
        render(
            <PenaltyOrderPanel
                matchId="123"
                players={mockPlayers}
                behaviors={mockBehaviors}
                endsAt={futureEndsAt}
            />
        );

        const behaviorSelects = screen.getAllByDisplayValue("Comportamiento");
        expect(behaviorSelects).toHaveLength(5);

        // Debería incluir 'Atacante' pero NO 'Estrategia Global'
        expect(screen.getAllByText("Atacante").length).toBeGreaterThan(0);
        expect(screen.queryByText("Estrategia Global")).not.toBeInTheDocument();
    });

    test("3. Deshabilita el boton de confirmar hasta que los 5 slots tienen jugador y comportamiento seleccionados", async () => {
        render(
            <PenaltyOrderPanel
                matchId="123"
                players={mockPlayers}
                behaviors={mockBehaviors}
                endsAt={futureEndsAt}
            />
        );

        const confirmButton = screen.getByRole("button", { name: /Confirmar elección/i });
        expect(confirmButton).toBeDisabled();

        const playerSelects = screen.getAllByDisplayValue("Jugador");
        const behaviorSelects = screen.getAllByDisplayValue("Comportamiento");

        // Completa los 5 slots
        for (let i = 0; i < 5; i++) {
            fireEvent.change(playerSelects[i], { target: { value: mockPlayers[i].player_id } });
            fireEvent.change(behaviorSelects[i], { target: { value: "b1" } });
        }

        expect(confirmButton).not.toBeDisabled();
    });

    test("4. Envía los pateadores exitosamente ", async () => {
        setPenaltyOrder.mockResolvedValueOnce({ status: "ok" });

        render(
            <PenaltyOrderPanel
                matchId="123"
                players={mockPlayers}
                behaviors={mockBehaviors}
                endsAt={futureEndsAt}
            />
        );

        const playerSelects = screen.getAllByDisplayValue("Jugador");
        const behaviorSelects = screen.getAllByDisplayValue("Comportamiento");

        for (let i = 0; i < 5; i++) {
            fireEvent.change(playerSelects[i], { target: { value: mockPlayers[i].player_id } });
            fireEvent.change(behaviorSelects[i], { target: { value: "b1" } });
        }

        fireEvent.click(screen.getByRole("button", { name: /Confirmar elección/i }));

        await waitFor(() => {
            expect(setPenaltyOrder).toHaveBeenCalledWith("123", [
                { player_id: "p1", behavior_id: "b1" },
                { player_id: "p2", behavior_id: "b1" },
                { player_id: "p3", behavior_id: "b1" },
                { player_id: "p4", behavior_id: "b1" },
                { player_id: "p5", behavior_id: "b1" },
            ]);
            expect(screen.getByText("Orden confirmado")).toBeInTheDocument();
        });
    });

    test("5. Muestra error si falla el guardado de los pateadores", async () => {
        setPenaltyOrder.mockRejectedValueOnce(new Error("Error al guardar el orden"));

        render(
            <PenaltyOrderPanel
                matchId="123"
                players={mockPlayers}
                behaviors={mockBehaviors}
                endsAt={futureEndsAt}
            />
        );

        const playerSelects = screen.getAllByDisplayValue("Jugador");
        const behaviorSelects = screen.getAllByDisplayValue("Comportamiento");

        for (let i = 0; i < 5; i++) {
            fireEvent.change(playerSelects[i], { target: { value: mockPlayers[i].player_id } });
            fireEvent.change(behaviorSelects[i], { target: { value: "b1" } });
        }

        fireEvent.click(screen.getByRole("button", { name: /Confirmar elección/i }));

        expect(await screen.findByText("Error al guardar el orden")).toBeInTheDocument();
    });
});