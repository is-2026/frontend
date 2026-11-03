import { render, screen, act } from "@testing-library/react";
import { describe, test, expect, vi, afterEach } from "vitest";
import { NextMatchCard } from "./NextMatchCard";

// armo un partido programado, y cada test cambia solo lo que necesita
function crearPartido(cambios) {
    return {
        id: "m1",
        round: 1,
        status: "scheduled",
        home_club_id: "c1",
        away_club_id: "c2",
        home_club_name: "River",
        away_club_name: "Boca",
        ...cambios,
    };
}

describe("NextMatchCard", () => {
    afterEach(() => {
        // dejo los timers como estaban para que no afecten a los test
        vi.useRealTimers();
    });

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
            crearPartido({ id: "m1", round: 1, home_club_id: "c2", away_club_id: "c3" }),
            crearPartido({ id: "m2", round: 2, home_club_id: "c1", away_club_id: "c2" }),
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

    test("la cuenta regresiva aparece despues del primer segundo", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));

        // el partido empieza en 5 min 30 seg
        const matches = [crearPartido({ starts_at: "2026-01-01T12:05:30Z" })];

        render(<NextMatchCard matches={matches} myClubId="c1" />);

        // antes del primer segundo todavia no hay cuenta
        expect(screen.queryByText(/min .* seg/)).not.toBeInTheDocument();

        // pasa 1 segundo: faltan 5 min 29 seg
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText("5 min 29 seg")).toBeInTheDocument();
        // si hay starts_at no se muestra el texto de "cuando termine la fecha"
        expect(screen.queryByText("Cuando termine la fecha")).not.toBeInTheDocument();
    });

    test("la cuenta regresiva baja con cada segundo", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));

        const matches = [crearPartido({ starts_at: "2026-01-01T12:05:30Z" })];

        render(<NextMatchCard matches={matches} myClubId="c1" />);

        // pasan 31 segundos: faltan 4 min 59 seg
        act(() => {
            vi.advanceTimersByTime(31000);
        });

        expect(screen.getByText("4 min 59 seg")).toBeInTheDocument();
    });
});