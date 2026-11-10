import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "./api"; // Importamos la función de request
import {
	getFriendlies,
    createFriendlies,
    getFriendlyById,
    joinFriendly,
    cancelfriendly,
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

		it("debe enviar el texto de búsqueda como query param 'club_name'", async () => {
			vi.spyOn(api, "request").mockResolvedValue([]);

			await getFriendlies("  Atlético & Co  ");

			expect(api.request).toHaveBeenCalledWith("/friendlies?club_name=Atl%C3%A9tico%20%26%20Co");
		});

		it.each([undefined, "", "   "])("no debe enviar 'club_name' si el texto es %j", async (text) => {
			vi.spyOn(api, "request").mockResolvedValue([]);

			await getFriendlies(text);

			expect(api.request).toHaveBeenCalledWith("/friendlies");
		});

		it("debe lanzar un error cuando el backend responde con error (ej. 400 Bad Request)", async () => {
			// Mock de error del backend
			const errorMessage = "Error 400: El usuario no tiene un club asignado.";
			vi.spyOn(api, "request").mockRejectedValue(new Error(errorMessage));

			await expect(getFriendlies()).rejects.toThrow(errorMessage);
		});
	});

	describe("getFriendlyById", () => {
		it("debe devolver el amistoso con ese id", async () => {
			vi.spyOn(api, "request").mockResolvedValue([{ id: "1" }, { id: "2" }]);

			expect(await getFriendlyById("2")).toEqual({ id: "2" });
			expect(api.request).toHaveBeenCalledWith("/friendlies");
		});

		it("debe devolver undefined si no existe", async () => {
			vi.spyOn(api, "request").mockResolvedValue([{ id: "1" }]);

			expect(await getFriendlyById("999")).toBeUndefined();
		});
	});

	it("createFriendlies debe hacer POST a /friendlies con el body", async () => {
		vi.spyOn(api, "request").mockResolvedValue({ id: "f1" });
		const data = { players: [] };

		await createFriendlies(data);

		expect(api.request).toHaveBeenCalledWith("/friendlies", { method: "POST", body: JSON.stringify(data) });
	});

	it("joinFriendly debe hacer POST a /friendlies/{id}/join con el body", async () => {
		vi.spyOn(api, "request").mockResolvedValue({});
		const data = { password: "x", players: [] };

		await joinFriendly("f1", data);

		expect(api.request).toHaveBeenCalledWith("/friendlies/f1/join", { method: "POST", body: JSON.stringify(data) });
	});

	it("cancelfriendly debe hacer DELETE a /friendlies/{id}", async () => {
		vi.spyOn(api, "request").mockResolvedValue(null);

		await cancelfriendly("f1");

		expect(api.request).toHaveBeenCalledWith("/friendlies/f1", { method: "DELETE" });
	});
});
