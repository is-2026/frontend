import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "./api"; // Importamos la función de request
import {
  getFriendlies,
} from "./friendlies";

describe("friendlies service", () => {
  // Limpia las simulaciones antes de cada test
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getFriendlies", () => {
    it("debe retornar la lista de amistosos cuando la petición es exitosa", async () => {
      // Mock de respuesta exitosa del backend
      const mockFriendlies = [
        { id: "1", creator_club_id: "club-1", is_private: false, status: "waiting_for_rival" },
        { id: "2", creator_club_id: "club-2", is_private: true, status: "waiting_for_rival" },
      ];

      vi.spyOn(api, "request").mockResolvedValue(mockFriendlies); 
      //Simula llamada exitosa y devuelve inmediatamente promise resuelta con valor mockFriendlies
      //Para ello intercepta request de api y la reemplaza por mockFriendlies.

      const result = await getFriendlies(); // Espera a que la promesa se resuelva

      expect(api.request).toHaveBeenCalledWith("/friendlies"); //verifica que la ruta esté bien
      expect(result).toEqual(mockFriendlies); //verifica que la request pedida por getFriendlies sea correcta
      expect(result.length).toBe(2); 
    });

    it("debe lanzar un error cuando el backend responde con error (ej. 400 Bad Request)", async () => {
      // Mock de error del backend
      const errorMessage = "Error 400: El usuario no tiene un club asignado.";
      vi.spyOn(api, "request").mockRejectedValue(new Error(errorMessage));

      await expect(getFriendlies()).rejects.toThrow(errorMessage);
    });
  });
});