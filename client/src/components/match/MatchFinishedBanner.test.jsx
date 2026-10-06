import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { formatMatchTime } from "./utils/utils";
import { MatchHeader } from "./MatchHeader";

describe("MatchHeader", () => {
    test("renderiza los nombres de los equipos y los marcadores por defecto en 0", () => {
        render(<MatchHeader />);

        expect(screen.getByText("Equipo Local")).toBeInTheDocument();
        expect(screen.getByText("Equipo Rival")).toBeInTheDocument();
        // Verifica que los marcadores por defecto muestren 0
        const scores = screen.getAllByText("0");
        expect(scores.length).toBeGreaterThanOrEqual(2);
    });

    test("muestra marcadores correctos cuando se le pasan por props", () => {
        const mockScores = { home: 3, away: 1 };
        render(<MatchHeader scores={mockScores} />);

        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("formatea y muestra el tiempo correctamente a partir de los ticks", () => {
        // 1250 ticks = 125 segundos = 2 minutos y 5 segundos (02:05)
        render(<MatchHeader tick={1250} />);

        expect(screen.getByText("02:05")).toBeInTheDocument();
    });
});