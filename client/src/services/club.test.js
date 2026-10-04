import { describe, test, expect, vi, beforeEach } from "vitest";
import { createClub, DEFAULT_AVATAR } from "./club";
import { request } from "./api";

// Mockear el cliente HTTP (api.js)
vi.mock("./api", () => ({
    request: vi.fn(),
}));

describe("club service (createClub)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("envía la petición POST con el avatar provisto por el usuario", async () => {
        const dataInput = {
            club_name: "River Plate",
            avatar_url: "https://avatarejemplo.com/ej.png",
        };

        await createClub(dataInput);

        expect(request).toHaveBeenCalledWith("/club", {
            method: "POST",
            body: JSON.stringify({
                club_name: "River Plate",
                avatar_url: "https://avatarejemplo.com/ej.png",
            }),
        });
    });

    test("asigna DEFAULT_AVATAR si no se pasa avatar_url o está en blanco", async () => {
        const dataInput = {
            club_name: "River Plate",
            avatar_url: "   ",
        };

        await createClub(dataInput);

        expect(request).toHaveBeenCalledWith("/club", {
            method: "POST",
            body: JSON.stringify({
                club_name: "River Plate",
                avatar_url: DEFAULT_AVATAR,
            }),
        });
    });
});
