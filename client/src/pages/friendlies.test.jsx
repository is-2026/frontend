// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from 'react-router-dom';
import { FriendliesPage } from "./FriendliesPage";
import * as friendliesService from "../services/friendlies";

describe("FriendliesPage Component", () => {
  it("debe mostrar 'Cargando...' mientras se obtienen los amistosos", () => {
    // Congela la llamada para que se quede en estado de carga (loading = true)
    vi.spyOn(friendliesService, "getFriendlies").mockReturnValue(new Promise(() => {}));

    render(
        <MemoryRouter>
            <FriendliesPage />
        </MemoryRouter>
    );

    // Verifica que exista el mensaje "Cargando..." en pantalla
    expect(screen.getByText(/cargando amistosos/i)).toBeDefined();
  });

  it("debe mostrar el mensaje de error cuando la petición falla", async () => {
    const mensajeError = "Error: Algo falló en el servidor";

    // Simula que la API rechaza la promesa con un error
    vi.spyOn(friendliesService, "getFriendlies").mockRejectedValue(
      new Error(mensajeError)
    );

    render(
        <MemoryRouter>
            <FriendliesPage />
        </MemoryRouter>
    );

    // findByText espera asincrónicamente al catch() del componente 
    const errorElement = await screen.findByText(mensajeError);

    expect(errorElement).toBeDefined();
  });
});