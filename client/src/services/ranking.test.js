import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "./api";
import { getRanking } from "./ranking";

describe("ranking service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getRanking", () => {
    it("debe retornar el ranking cuando la petición es exitosa", async () => {
      const mockRanking = [
        { position: 1, club_id: "c1", club_name: "River", points: 15 },
        { position: 2, club_id: "c2", club_name: "Boca", points: 12 },
      ];

      vi.spyOn(api, "request").mockResolvedValue(mockRanking);

      const result = await getRanking();

      expect(api.request).toHaveBeenCalledWith("/ranking", { method: "GET" });
      expect(result).toEqual(mockRanking);
      expect(result.length).toBe(2);
    });

    it("debe lanzar un error cuando el backend responde con error", async () => {
      const errorMessage = "Error 401: Unauthorized";
      vi.spyOn(api, "request").mockRejectedValue(new Error(errorMessage));

      await expect(getRanking()).rejects.toThrow(errorMessage);
    });
  });
});