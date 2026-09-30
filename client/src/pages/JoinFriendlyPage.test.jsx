// @vitest-environment jsdom
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi, describe, it, expect,afterEach, beforeEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import JoinFriendlyPage from "./JoinFriendlyPage";
import * as friendliesService from "../services/friendlies";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mockeamos PlayerSelection
vi.mock("../components/PlayerSelection", () => ({
  default: ({ onChange }) => (
    <div data-testid="player-selection">
      <button
        onClick={() =>
          onChange({
            starters: [
              { player_id: "j1", behavior_id: "ofensivo" },
              { player_id: "j2", behavior_id: "defensivo" },
              { player_id: "j3", behavior_id: "equilibrado" },
            ],
            substitutes: ["j4", "j5", "j6"],
          })
        }
      >
        Simular Selección Completa
      </button>
    </div>
  ),
}));

// Mockeamos los servicios de la API
vi.spyOn(friendliesService, "getFriendlyById");
vi.spyOn(friendliesService, "joinFriendly");

function renderWithRouter(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/friendlies/:friendlyId/join" element={<JoinFriendlyPage />} />
        <Route path="/friendlies/:friendlyId/lobby" element={<div>Lobby del partido</div>} />
        <Route path="/friendlies" element={<div>Lista de partidos</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("JoinFriendlyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Muestra directamente la alineación si el partido es público", async () => {
    friendliesService.getFriendlyById.mockResolvedValue({
      id: "1",
      is_private: false,
    });

    renderWithRouter("/friendlies/1/join");

    await waitFor(() => {
      expect(screen.getByText("Elegí tu alineación")).toBeInTheDocument();
      expect(screen.getByTestId("player-selection")).toBeInTheDocument();
    });
  });

  it("2. Pide contraseña en partido privado y muestra error si es incorrecta", async () => {
    friendliesService.getFriendlyById.mockResolvedValue({
      id: "2",
      is_private: true,
      password: "secretpass",
    });

    renderWithRouter("/friendlies/2/join");

    await waitFor(() => {
      expect(screen.getByText("Amistoso privado")).toBeInTheDocument();
    });

    const inputPassword = screen.getByPlaceholderText("Contraseña");
    const btnContinuar = screen.getByRole("button", { name: "Continuar" });

    // Ingresamos contraseña errónea
    await userEvent.type(inputPassword, "clave_incorrecta");
    await userEvent.click(btnContinuar);

    // Debe mostrar la alerta de contraseña incorrecta y quedarse en la misma pantalla
    await waitFor(() => {
      expect(screen.getByText("La contraseña es incorrecta.")).toBeInTheDocument();
    });
    expect(screen.queryByText("Elegí tu alineación")).not.toBeInTheDocument();
  });

  it("3. Permite avanzar y unirse correctamente si la contraseña es válida", async () => {
    friendliesService.getFriendlyById.mockResolvedValue({
      id: "2",
      is_private: true,
      password: "secretpass",
    });
    friendliesService.joinFriendly.mockResolvedValue({ success: true });

    renderWithRouter("/friendlies/2/join");

    await waitFor(() => {
      expect(screen.getByText("Amistoso privado")).toBeInTheDocument();
    });

    // Ingresamos contraseña correcta
    await userEvent.type(screen.getByPlaceholderText("Contraseña"), "secretpass");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    // Pasa a la pantalla de alineación
    await waitFor(() => {
      expect(screen.getByText("Elegí tu alineación")).toBeInTheDocument();
    });

    // Simulamos la selección de 6 jugadores
    await userEvent.click(screen.getByText("Simular Selección Completa"));

    // Confirmamos la inscripción
    const btnConfirmar = screen.getByRole("button", { name: "Confirmar" });
    expect(btnConfirmar).not.toBeDisabled();
    await userEvent.click(btnConfirmar);

    // Verifica que llamó a la API con los datos correctos
    await waitFor(() => {
      expect(friendliesService.joinFriendly).toHaveBeenCalledWith("2", {
        password: "secretpass",
        players: [
          { player_id: "j1", is_starter: true, behavior_id: "ofensivo" },
          { player_id: "j2", is_starter: true, behavior_id: "defensivo" },
          { player_id: "j3", is_starter: true, behavior_id: "equilibrado" },
          { player_id: "j4", is_starter: false },
          { player_id: "j5", is_starter: false },
          { player_id: "j6", is_starter: false },
        ],
      });
      // Verifica redirección al lobby
      expect(screen.getByText("Lobby del partido")).toBeInTheDocument();
    });
  });
});