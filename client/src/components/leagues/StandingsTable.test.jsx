import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { StandingsTable } from "./StandingsTable";

const standings = [
    {
        club_id: "c1",
        club_name: "River",
        points: 9,
        matches_played: 3,
        won: 3,
        won_penalties: 0,
        drawn: 0,
        lost: 0,
        goals_for: 6,
        goals_against: 2,
    },
    {
        club_id: "c1",
        club_name: "Boca",
        points: 9,
        matches_played: 3,
        won: 0,
        won_penalties: 2,
        drawn: 0,
        lost: 1,
        goals_for: 9,
        goals_against: 12,
    },
    {
        club_id: "c3",
        club_name: "Independiente",
        points: 1,
        matches_played: 3,
        won: 0,
        won_penalties: 0,
        drawn: 1,
        lost: 2,
        goals_for: 4,
        goals_against: 13,
    },
];

describe("StandingsTable", () => {
    test("muestra un mensaje si no hay posiciones", () => {
        render(<StandingsTable standings={[]} />);

        expect(screen.getByText("Todavía no hay posiciones para mostrar.")).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
    
     test("muestra un mensaje si standings es undefined", () => {
        render(<StandingsTable />);

        expect(screen.getByText("Todavía no hay posiciones para mostrar.")).toBeInTheDocument();
    });

    test("muestra los encabezados de la tabla", () => {
        render(<StandingsTable standings={standings} />);

        expect(screen.getByRole("columnheader", { name: "Pos" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Club" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Pts" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "DG" })).toBeInTheDocument();
    });

    test("calcula la diferencia de gol: positiva con +, cero y negativa", () => {
        render(<StandingsTable standings={standings} />);

        // con tus datos: River 6 - 2 = +4, Boca 9 - 12 = -3, Independiente 4 - 13 = -9
        expect(screen.getByText("+4")).toBeInTheDocument();
        expect(screen.getByText("-3")).toBeInTheDocument();
        expect(screen.getByText("-9")).toBeInTheDocument();
    });

    test("muestra '-' cuando el club no tiene won_penalties", () => {
        // en tus datos todos tienen won_penalties, asi que armo un club sin ese campo
        const clubSinPenales = [
            { club_id: "x", club_name: "Sin penales", goals_for: 1, goals_against: 0 },
        ];

        render(<StandingsTable standings={clubSinPenales} />);

        // la columna PG pen. es la 6ta (indice 5)
        const rows = screen.getAllByRole("row");
        expect(rows[1].querySelectorAll("td")[5]).toHaveTextContent("-");
    });
});