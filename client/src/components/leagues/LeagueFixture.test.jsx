import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect } from "vitest";
import { LeagueFixture } from "./LeagueFixture";

const clubs = [
    { club_id: "c1", club_name: "River" },
    { club_id: "c2", club_name: "Boca" },
    { club_id: "c3", club_name: "Racing" },
];

// una fecha por cada estado, y en cada fecha queda un club libre
const matches = [
    {
        id: "m1",
        round_number: 1,
        status: "finished",
        home_club_id: "c1",
        away_club_id: "c2",
        home_club_name: "River",
        away_club_name: "Boca",
        home_score: 3,
        away_score: 1,
    },
    {
        id: "m2",
        round_number: 2,
        status: "in_progress",
        home_club_id: "c2",
        away_club_id: "c3",
        home_club_name: "Boca",
        away_club_name: "Racing",
        home_score: null,
        away_score: null,
    },
    {
        id: "m3",
        round_number: 3,
        status: "scheduled",
        home_club_id: "c1",
        away_club_id: "c3",
        home_club_name: "River",
        away_club_name: "Racing",
        home_score: null,
        away_score: null,
    },
];

// como el componente usa Link, asi que necesita estar dentro de un Router
function renderFixture(matchesProp, clubsProp) {
    render(
        <MemoryRouter>
            <LeagueFixture matches={matchesProp} clubs={clubsProp} />
        </MemoryRouter>
    );
}

describe("LeagueFixture", () => {
    test("muestra un mensaje si no hay partidos", () => {
        renderFixture([], clubs);

        expect(screen.getByText("Todavía no hay partidos programados.")).toBeInTheDocument();
    });

    test("muestra un titulo por cada fecha", () => {
        renderFixture(matches, clubs);

        expect(screen.getByText("Fecha 1")).toBeInTheDocument();
        expect(screen.getByText("Fecha 2")).toBeInTheDocument();
        expect(screen.getByText("Fecha 3")).toBeInTheDocument();
    });

    test("partido finalizado muestra el resultado y el estado", () => {
        renderFixture(matches, clubs);

        expect(screen.getByText("3 - 1")).toBeInTheDocument();
        expect(screen.getByText("Finalizado")).toBeInTheDocument();
    });

    test("partido programado muestra 'vs' y el estado", () => {
        renderFixture(matches, clubs);

        expect(screen.getAllByText("vs")).toHaveLength(2);
        expect(screen.getByText("Programado")).toBeInTheDocument();
    });

    test("partido en juego sin resultado muestra 'vs', el estado y el boton 'Ver en vivo'", () => {
        renderFixture(matches, clubs);

        expect(screen.queryByText("null - null")).not.toBeInTheDocument();
        expect(screen.getByText("En juego")).toBeInTheDocument();

        const link = screen.getByRole("link", { name: "Ver en vivo" });
        expect(link).toHaveAttribute("href", "/match/m2");
    });

    test("solo los partidos en juego tienen el boton 'Ver en vivo'", () => {
        renderFixture(matches, clubs);

        // hay 3 partidos pero solo 1 esta en juego
        expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    test("muestra que club esta libre en cada fecha", () => {
        renderFixture(matches, clubs);

        expect(screen.getByText("Libre: Racing")).toBeInTheDocument(); // fecha 1
        expect(screen.getByText("Libre: River")).toBeInTheDocument(); // fecha 2
        expect(screen.getByText("Libre: Boca")).toBeInTheDocument(); // fecha 3
    });
});
