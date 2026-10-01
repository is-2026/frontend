// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LeaguesPage from "./LeaguesPage";
import * as leaguesService from "../services/leagues";

describe("LeaguesPage Component", () => {
  it("debe mostrar 'Cargando...' mientras se obtienen las ligas", () => {
    vi.spyOn(leaguesService, "getLeagues").mockReturnValue(new Promise(() => {}));

    render(<LeaguesPage />);

    expect(screen.getByText("Cargando...")).toBeDefined();
  });

  it("debe mostrar el mensaje de error cuando la petición falla", async () => {
    const mensajeError = "Error: Algo falló en el servidor";
    vi.spyOn(leaguesService, "getLeagues").mockRejectedValue(new Error(mensajeError));

    render(<LeaguesPage />);

    const errorElement = await screen.findByText(mensajeError);
    expect(errorElement).toBeDefined();
  });

  it("debe mostrar mensaje indicando que no hay ligas si la lista viene vacía", async () => {
    vi.spyOn(leaguesService, "getLeagues").mockResolvedValue([]);
    
    render(<LeaguesPage />);
    
    const emptyMessage = await screen.findByText("No hay ligas disponibles por ahora.");
    expect(emptyMessage).toBeDefined();
  });
});