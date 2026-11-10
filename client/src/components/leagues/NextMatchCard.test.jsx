import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { NextMatchCard } from "./NextMatchCard";

// armo un partido programado, y cada test cambia solo lo que necesita
function crearPartido(cambios) {
    return {
        id: "m1",
        round_number: 1,
        status: "scheduled",
        home_club_id: "c1",
        away_club_id: "c2",
        home_club_name: "River",
        away_club_name: "Boca",
        ...cambios,
    };
}

describe("NextMatchCard", () => {
    
    test("muestra un mensaje si no quedan partidos programados", () => {
        const matches = [ crearPartido({ status: "finished" })];

        render(<NextMatchCard matches = {matches} myClubId ="c1" />);
        expect(screen.getByText("No quedan partidos por jugar.")).toBeInTheDocument();
    });

    test("muestra 'Fecha libre' si mi club no juega en la prox fecha", () => {
        // la prox fecha es la 1 y la juegan c2 y c3, mi club es c1
        const matches = [
            crearPartido({ home_club_id: "c2", away_club_id: "c3" }),
        ];

        render(<NextMatchCard matches = {matches} myClubId ="c1" />);
        expect(screen.getByText("Fecha libre")).toBeInTheDocument();
    });

    test("muestra 'Fecha libre' si mi prox partido es en una fecha posterior", () => {
        // la prox fecha es la 1 (c2 vs c3), mi club recien juega en la 2
        const matches = [
            crearPartido({ id: "m1", round_number: 1, home_club_id: "c2", away_club_id: "c3" }),
            crearPartido({ id: "m2", round_number: 2, home_club_id: "c1", away_club_id: "c2" }),
        ];

        render(<NextMatchCard matches={matches} myClubId="c1" />);
        expect(screen.getByText("Fecha libre")).toBeInTheDocument();
    });

    test("muestra la fecha y los clubes de mi proximo partido", () => {
        const matches = [crearPartido()];

        render(<NextMatchCard matches={matches} myClubId="c1" />);

        expect(screen.getByText("Fecha 1")).toBeInTheDocument();
        expect(screen.getByText("River vs Boca")).toBeInTheDocument();
    });

    test("muestra 'Cuando termine la fecha' en mi proximo partido", () => {
        const matches = [crearPartido()];

        render(<NextMatchCard matches={matches} myClubId="c1" />);
        expect(screen.getByText("Cuando termine la fecha")).toBeInTheDocument();
    });
});