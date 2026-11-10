// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LeaguesPage } from "./LeaguesPage";
import { MemoryRouter } from "react-router-dom";
import * as leaguesService from "../services/leagues";

describe("LeaguesPage Component", () => {
  it("debe mostrar 'Cargando...' mientras se obtienen las ligas", () => {
    vi.spyOn(leaguesService, "getLeagues").mockReturnValue(new Promise(() => {}));

    render(
    <MemoryRouter>
      <LeaguesPage />
    </MemoryRouter>
    );

    expect(screen.getByText("Cargando ligas...")).toBeDefined();
  });

  it("debe mostrar el mensaje de error cuando la petición falla", async () => {
    const mensajeError = "Error: Algo falló en el servidor";
    vi.spyOn(leaguesService, "getLeagues").mockRejectedValue(new Error(mensajeError));

    render(
      <MemoryRouter>
        <LeaguesPage />
      </MemoryRouter>
    );

    const errorElement = await screen.findByText(mensajeError);
    expect(errorElement).toBeDefined();
  });

  it("debe mostrar mensaje indicando que no hay ligas si la lista viene vacía", async () => {
    vi.spyOn(leaguesService, "getLeagues").mockResolvedValue([]);
    vi.spyOn(leaguesService, "getMyLeagues").mockResolvedValue([]);

    render(
      <MemoryRouter>
        <LeaguesPage />
      </MemoryRouter>
    );
    
    const emptyMessage = await screen.findByText("No hay ligas disponibles.");
    expect(emptyMessage).toBeDefined();
  });

  test("debe mostrar mis ligas con nombre, estado y clubes al entrar a la pestaña 'mis ligas'", async () => {
    vi.spyOn(leaguesService, "getLeagues").mockResolvedValue([]);
    vi.spyOn(leaguesService, "getMyLeagues").mockResolvedValue([
      { id: "1", name: "Liga A", status: "started", max_clubs: 10, registered_clubs: [{ club_id: "c1" }, { club_id: "c2" }] }
    ]);

    render(
      <MemoryRouter>
        <LeaguesPage />
      </MemoryRouter>
    );

    // Se espera a que finalice la carga inicial de "Disponibles" para evitar race condition
    await screen.findByText("No hay ligas disponibles.");

    fireEvent.click(screen.getByText("Mis ligas"));

    expect(await screen.findByText("Liga A")).toBeDefined();
  });

  test("debe mostrar el mensaje si no participa de ninguna liga", async () => {
    vi.spyOn(leaguesService, "getLeagues").mockResolvedValue([]);
    vi.spyOn(leaguesService, "getMyLeagues").mockResolvedValue([]);

    render(
      <MemoryRouter>
        <LeaguesPage/>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Mis ligas"));
    expect(await screen.findByText("No participás en ninguna liga.")).toBeDefined();
  });
});