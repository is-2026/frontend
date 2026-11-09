// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RankingCard from "./RankingCard";

const club = { position: 1, club_id: "c1", club_name: "River", avatar_url: "river.png", points: 15, matches_played: 6, won: 4, won_penalties: 1, drawn: 1, lost: 0, goals_for: 14, goals_against: 4 };

describe("RankingCard Component", () => {
  it("debe mostrar posición, nombre, puntos y estadísticas", () => {
    render(<MemoryRouter><RankingCard club={club} isMine={false} /></MemoryRouter>);

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("River")).toBeDefined();
    expect(screen.getByText(/15 pts/)).toBeDefined();
    expect(screen.getByText(/PJ 6/)).toBeDefined();
    expect(screen.getByText(/PG pen. 1/)).toBeDefined();
  });

  it("debe calcular la diferencia de gol", () => {
    render(<MemoryRouter><RankingCard club={club} isMine={false} /></MemoryRouter>);

    expect(screen.getByText(/DG 10/)).toBeDefined();
  });

  it("el nombre del club debe llevar a su perfil", () => {
    render(<MemoryRouter><RankingCard club={club} isMine={false} /></MemoryRouter>);

    expect(screen.getByRole("link", { name: "River" }).getAttribute("href")).toBe("/clubs/c1");
  });

  it("debe mostrar el avatar del club", () => {
    render(<MemoryRouter><RankingCard club={club} isMine={false} /></MemoryRouter>);

    expect(screen.getByAltText("River").getAttribute("src")).toBe("river.png");
  });
});