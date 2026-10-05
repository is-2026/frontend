import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "./api"; 
import { createLeagues } from "./leagues";

describe("leagues service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
});