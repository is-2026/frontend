import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "./api";
import { getLeagues } from "./leagues";

describe("leagues service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getLeagues", () => {
    it("debe retornar la lista de ligas cuando la petición es exitosa", async () => {
      // Mock con la estructura exacta que manda tu backend en el yaml
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

      expect(api.request).toHaveBeenCalledWith("/ligas");
      expect(result).toEqual(mockLeagues);
      expect(result.length).toBe(2);
    });

    it("debe lanzar un error cuando el backend responde con error", async () => {
      const errorMessage = "Error 400: Bad Request";
      vi.spyOn(api, "request").mockRejectedValue(new Error(errorMessage));

      await expect(getLeagues()).rejects.toThrow(errorMessage);
    });
  });
});