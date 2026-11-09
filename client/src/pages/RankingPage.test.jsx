// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { RankingPage } from "./RankingPage";
import * as rankingService from "../services/ranking";
import * as clubService from "../services/club";

const mockRanking = [
  { position: 1, club_id: "c1", club_name: "River", avatar_url: "river.png", points: 15, matches_played: 6, won: 4, won_penalties: 1, drawn: 1, lost: 0, goals_for: 14, goals_against: 4 },
  { position: 2, club_id: "c2", club_name: "Boca", avatar_url: "boca.png", points: 12, matches_played: 6, won: 3, won_penalties: 1, drawn: 1, lost: 1, goals_for: 10, goals_against: 7 },
];

describe("RankingPage Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(clubService, "getMyClub").mockResolvedValue({ id: "c2" });
  });

  it("debe mostrar 'Cargando...' mientras se obtiene el ranking", () => {
    vi.spyOn(rankingService, "getRanking").mockReturnValue(new Promise(() => {}));

    render(<MemoryRouter><RankingPage /></MemoryRouter>);

    expect(screen.getByText("Cargando...")).toBeDefined();
  });

  it("debe mostrar el mensaje de error cuando la petición falla", async () => {
    const mensajeError = "Error: Algo falló en el servidor";
    vi.spyOn(rankingService, "getRanking").mockRejectedValue(new Error(mensajeError));

    render(<MemoryRouter><RankingPage /></MemoryRouter>);

    const errorElement = await screen.findByText(mensajeError);
    expect(errorElement).toBeDefined();
  });

  it("debe mostrar mensaje indicando que no hay clubes si el ranking viene vacío", async () => {
    vi.spyOn(rankingService, "getRanking").mockResolvedValue([]);

    render(<MemoryRouter><RankingPage /></MemoryRouter>);

    const emptyMessage = await screen.findByText("No hay clubes en el ranking.");
    expect(emptyMessage).toBeDefined();
  });

  it("debe mostrar los clubes del ranking", async () => {
    vi.spyOn(rankingService, "getRanking").mockResolvedValue(mockRanking);

    render(<MemoryRouter><RankingPage /></MemoryRouter>);

    expect(await screen.findByText("River")).toBeDefined();
    expect(screen.getByText("Boca")).toBeDefined();
  });

  it("debe aclarar que el ranking contempla solo ligas públicas", () => {
    vi.spyOn(rankingService, "getRanking").mockReturnValue(new Promise(() => {}));

    render(<MemoryRouter><RankingPage /></MemoryRouter>);

    expect(screen.getByText("Solo contempla ligas públicas.")).toBeDefined();
  });

  it("debe resaltar la fila del club del usuario", async () => {
    vi.spyOn(rankingService, "getRanking").mockResolvedValue(mockRanking);

    render(<MemoryRouter><RankingPage /></MemoryRouter>);

    const boca = await screen.findByText("Boca");
    const river = screen.getByText("River");
    expect(boca.closest("li").className).toContain("border-blue-500");
    expect(river.closest("li").className).not.toContain("border-blue-500");
  });
});