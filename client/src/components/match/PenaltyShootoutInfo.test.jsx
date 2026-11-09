import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { PenaltyShootoutInfo } from "./PenaltyShootoutInfo";

describe("PenaltyShootoutInfo", () => {
    const mockProps = {
        penaltyKick: {
            kickerId: "p1",
            defenderId: "p2",
            number: 1,
            penaltyTicks: 300,
        },
        penaltyResult: null,
        state: { tick: 100 },
        lineups: {
            home: [{ player_id: "p1", name: "Pateador Local" }],
            away: [{ player_id: "p2", name: "Arquero Rival" }],
        },
        teams: {
            home: { name: "Boca" },
            away: { name: "River" },
        },
        penaltyTicks: 300,
    };

    test("1. penaltyKick = null devuelve null", () => {
        const { container } = render(<PenaltyShootoutInfo {...mockProps} penaltyKick={null} />);
        expect(container.firstChild).toBeNull();
    });

    test("2. Muestra numero de penal y nombres de pateador y arquero", () => {
        render(<PenaltyShootoutInfo {...mockProps} />);

        expect(screen.getByText("Penal #1")).toBeInTheDocument();
        expect(screen.getByText("Pateador Local")).toBeInTheDocument();
        expect(screen.getByText("Arquero Rival")).toBeInTheDocument();
        expect(screen.getByText(/Boca 0 - 0 River/i)).toBeInTheDocument();
    });

    test("3. Muestra goles desde penaltyResult", () => {
        const resultProps = {
            ...mockProps,
            penaltyResult: {
                number: 1,
                homePenalties: 1,
                awayPenalties: 0,
            },
        };

        render(<PenaltyShootoutInfo {...resultProps} />);
        expect(screen.getByText(/Boca 1 - 0 River/i)).toBeInTheDocument();
    });
});