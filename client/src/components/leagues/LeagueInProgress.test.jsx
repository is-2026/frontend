import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { LeagueInProgress } from "./LeagueInProgress";
import { getLeagueMatches, getStandings } from "../../services/leagues";
import { getMyClub } from "../../services/club";

// mockeo los servicios para no hacer pedidos reales al back
vi.mock("../../services/leagues", () => ({
    getLeagueMatches: vi.fn(),
    getStandings: vi.fn(),
}));

vi.mock("../../services/club", () => ({
    getMyClub: vi.fn(),
}));

const league = {
    id: "liga-123",
    name: "Liga Test",
    status: "started",
    registered_clubs: [
        { club_id: "c1", club_name: "River" },
        { club_id: "c2", club_name: "Boca" },
    ],
};

const matches = [
    {
        id: "m1",
        round: 1,
        status: "scheduled",
        home_club_id: "c1",
        away_club_id: "c2",
        home_club_name: "River",
        away_club_name: "Boca",
        home_score: 0,
        away_score: 0,
        starts_at: null,
    },
];

const standings = [
    {
        club_id: "c1",
        club_name: "River",
        points: 3,
        matches_played: 1,
        won: 1,
        drawn: 0,
        lost: 0,
        goals_for: 2,
        goals_against: 1,
    },
    {
        club_id: "c2",
        club_name: "Boca",
        points: 0,
        matches_played: 1,
        won: 0,
        drawn: 0,
        lost: 1,
        goals_for: 1,
        goals_against: 2,
    },
];

// el componente usa Link (en LeagueFixture), asi que necesita un Router
function renderLeague(leagueProp) {
    render(
        <MemoryRouter>
            <LeagueInProgress league={leagueProp} />
        </MemoryRouter>
    );
}

describe("LeagueInProgress", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // por defecto los 3 pedidos salen bien
        getLeagueMatches.mockResolvedValue(matches);
        getStandings.mockResolvedValue(standings);
        getMyClub.mockResolvedValue({ id: "c1" });
    });

    test("liga en curso: muestra el titulo, las secciones y mi proximo partido, sin campeon", async () => {
        renderLeague(league);

        expect(screen.getByText("Liga en curso")).toBeInTheDocument();
        expect(screen.getByText("Liga Test")).toBeInTheDocument();

        expect(await screen.findByText("Próximo partido")).toBeInTheDocument();
        expect(screen.getByText("Calendario")).toBeInTheDocument();
        expect(screen.getByText("Tabla de posiciones")).toBeInTheDocument();

        // mi club es c1 (River), asi que juega River vs Boca
        expect(screen.getByText("River vs Boca")).toBeInTheDocument();

        expect(screen.queryByText("Campeón")).not.toBeInTheDocument();
    });

    test("liga finalizada: muestra el titulo, el campeon y la tabla final", async () => {
        const finishedLeague = { ...league, status: "finished" };

        renderLeague(finishedLeague);

        expect(screen.getByText("Liga finalizada")).toBeInTheDocument();
        expect(screen.queryByText("Liga en curso")).not.toBeInTheDocument();

        expect(await screen.findByText("Campeón")).toBeInTheDocument();
        expect(screen.getByText("Tabla final")).toBeInTheDocument();
        expect(screen.getByText("Calendario")).toBeInTheDocument();
    });

    test("liga finalizada: no muestra el proximo partido ni 'Tabla de posiciones'", async () => {
        const finishedLeague = { ...league, status: "finished" };

        renderLeague(finishedLeague);

        await screen.findByText("Campeón");

        expect(screen.queryByText("Próximo partido")).not.toBeInTheDocument();
        expect(screen.queryByText("Tabla de posiciones")).not.toBeInTheDocument();
    });

     test("si falla un pedido muestra el mensaje de error y no las secciones", async () => {
        getLeagueMatches.mockRejectedValue(new Error("Falló el servidor"));

        renderLeague(league);

        expect(await screen.findByText("Falló el servidor")).toBeInTheDocument();
        expect(screen.queryByText("Cargando datos de la liga...")).not.toBeInTheDocument();
        expect(screen.queryByText("Calendario")).not.toBeInTheDocument();
    });

    test("si el error no trae mensaje muestra uno por defecto", async () => {
        getStandings.mockRejectedValue({});

        renderLeague(league);

        expect(
            await screen.findByText("Error al cargar los datos de la liga.")
        ).toBeInTheDocument();
    });
});