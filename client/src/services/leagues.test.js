import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "./api"; 
import { createLeagues, getLeagues, getLeague } from "./leagues";
import { request } from "./api";

vi.mock("./api", () => ({
  request: vi.fn(),
}));

describe("leagues service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getLeagues", () => {
    it("debe retornar la lista de ligas cuando la petición es exitosa", async () => {
      // Mock con datos de ligas
      const mockLeagues = [
        { 
          id: "1", 
          name: "Liga A", 
          is_private: false, 
          max_clubs: 10,
          status: "not_started",
          registered_clubs: [{ club_id: "c1", club_name: "Club 1" }] 
        },
        { 
          id: "2", 
          name: "Liga B", 
          is_private: true, 
          max_clubs: 15,
          status: "not_started",
          registered_clubs: [{ club_id: "c2", club_name: "Club 2" }, { club_id: "c3", club_name: "Club 3" }] 
        },
      ];

      vi.spyOn(api, "request").mockResolvedValue(mockLeagues); 

      const result = await getLeagues();

      expect(api.request).toHaveBeenCalledWith("/leagues", {
        method: "GET"
      });
      expect(result).toEqual(mockLeagues);
      expect(result.length).toBe(2);
    });

    it("debe lanzar un error cuando el backend responde con error", async () => {
      const errorMessage = "Error 400: Bad Request";
      vi.spyOn(api, "request").mockRejectedValue(new Error(errorMessage));

      await expect(getLeagues()).rejects.toThrow(errorMessage);
    });
  });
  
  describe("createLeagues", () => {
    it("ante una respuesta 201, debe enviar el payload a /leagues y retornar la liga creada", async () => {
      const mockData = {
        name: "Liga de Prueba",
        password: "123",
        max_clubs: 10,
        match_duration_minutes: 5,
        players: [
          { player_id: "p1", is_starter: true },
          { player_id: "p2", is_starter: true },
          { player_id: "p3", is_starter: true },
          { player_id: "p4", is_starter: false },
          { player_id: "p5", is_starter: false },
          { player_id: "p6", is_starter: false }
        ]
      };

      // Simula el 201 Created devolviendo el objeto de la liga creada
      const mockResponse = { id: "liga-123", status: "No iniciada" };
      vi.spyOn(api, "request").mockResolvedValue(mockResponse);

      const result = await createLeagues(mockData);

      expect(api.request).toHaveBeenCalledWith("/leagues", {
        method: "POST",
        body: JSON.stringify(mockData),
      });
      expect(result).toEqual(mockResponse);
    });

    it("ante una respuesta 400, debe lanzar un error con el status correspondiente", async () => {
      // Simula un error 400 Bad Request
      const mockError = new Error("Datos inválidos");
      mockError.status = 400;
      
      vi.spyOn(api, "request").mockRejectedValue(mockError);

      // Verifica que el servicio rechace la promesa con el error esperado
      await expect(createLeagues({})).rejects.toThrow(mockError);
      await expect(createLeagues({})).rejects.toHaveProperty("status", 400);
    });
  });

  describe("getLeague", () => {
    test("obtiene el detalle de la liga por el id consultado", async () => {
      const mockLeague = {
        id: "123",
        name: "Liga del ChiquiMafia",
        max_clubs: 30,
        registered_clubs: [],
      };

      request.mockResolvedValueOnce(mockLeague);
      const result = await getLeague("123");

      expect(request).toHaveBeenCalledWith("/leagues/123");
      expect(result).toEqual(mockLeague);
    });

    test("da error si la liga no existe o la API falla", async () => {
      request.mockRejectedValueOnce(new Error("Liga no encontrada"));

      await expect(getLeague("999")).rejects.toThrow("Liga no encontrada");
    });
  });
});