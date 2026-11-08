import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { formatMatchTime } from "./utils/utils";
import { MatchFinishedBanner } from "./MatchFinishedBanner"
import { MatchHeader } from "./MatchHeader";

const mockTeams = {
    home: { id: "club-h", name: "River" },
    away: { id: "club-a", name: "Atenas" },
};

const finishedBase = {
    tick: 3000,
    homeScore: 0,
    awayScore: 0,
    homePenalties: null,
    awayPenalties: null,
    winnerClubId: null,
};

describe("MatchHeader", () => {
     test("muestra el ganador y el marcador cuando se define en el tiempo de juego", () => {
        const mockFinished = { ...finishedBase, homeScore: 2, awayScore: 1, winnerClubId: "club-h" };
        render(<MatchFinishedBanner finished={mockFinished} teams={mockTeams} onExit={() => {}} />);

        expect(screen.getByText("River 2 - 1 Atenas")).toBeInTheDocument();
        expect(screen.getByText("Ganó River")).toBeInTheDocument();
    });

    test("muestra el ganador por penales y el resultado de la tanda", () => {
        const mockFinished = {
            ...finishedBase,
            homeScore: 1,
            awayScore: 1,
            homePenalties: 3,
            awayPenalties: 4,
            winnerClubId: "club-a",
        };
        render(<MatchFinishedBanner finished={mockFinished} teams={mockTeams} onExit={() => {}} />);

        expect(screen.getByText("Ganó Atenas por penales")).toBeInTheDocument();
        expect(screen.getByText("River 3 - 4 Atenas")).toBeInTheDocument();
        // el marcador del tiempo de juego no se muestra
        expect(screen.queryByText("River 1 - 1 Atenas")).not.toBeInTheDocument();
    });-

    test("muestra empate cuando termina igualado y no hubo penales", () => {
        const mockFinished = { ...finishedBase, homeScore: 1, awayScore: 1 };
        render(<MatchFinishedBanner finished={mockFinished} teams={mockTeams} onExit={() => {}} />);

        expect(screen.getByText("Empate")).toBeInTheDocument();
        expect(screen.getByText("River 1 - 1 Atenas")).toBeInTheDocument();
        expect(screen.queryByText(/por penales/)).not.toBeInTheDocument();
    });

    test("formatea y muestra el tiempo correctamente a partir de los ticks", () => {
        // 1250 ticks = 125 segundos = 2 minutos y 5 segundos (02:05)
        render(<MatchHeader tick={1250} />);

        expect(screen.getByText("02:05")).toBeInTheDocument();
    });
});