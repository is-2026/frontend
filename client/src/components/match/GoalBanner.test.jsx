import { render, screen, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { GoalBanner } from "./GoalBanner";

describe("GoalBanner", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("1. No renderiza nada si goalInfo es null", () => {
        render(<GoalBanner goalInfo={null} />);

        expect(screen.queryByText("¡GOL!")).toBeNull();
    });

    test("2. gol de local", () => {
        const goalInfo = {
            tick: 600,
            minute: 1,
            playerId: "p1",
            team: "home",
        };

        render(<GoalBanner goalInfo={goalInfo} />);

        expect(
            screen.getByText("¡GOL!")
        ).toBeInTheDocument();
        
        expect(
            screen.getByText("Equipo Local - minuto 1'"),
        ).toBeInTheDocument();
    });

    test("3. gol de rival", () => {
        const goalInfo = {
            tick: 1200,
            minute: 2,
            playerId: "p2",
            team: "away",
        };

        render(<GoalBanner goalInfo={goalInfo} />);

        expect(screen.getByText("¡GOL!")).toBeInTheDocument();
        expect(
            screen.getByText("Equipo Rival - minuto 2'"),
        ).toBeInTheDocument();
    });

    test("4. Oculta el banner automáticamente después de 2 segundos", () => {
        const goalInfo = {
            tick: 1200,
            minute: 2,
            playerId: "p1",
            team: "home",
        };

        render(<GoalBanner goalInfo={goalInfo} />);

        expect(screen.getByText("¡GOL!")).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.queryByText("¡GOL!")).toBeNull();
    });
});