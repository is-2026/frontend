import { describe, test, expect, vi } from "vitest";
import { getBehaviors, getBehaviorById } from "./behaviors";
import * as api from "./api";

describe("Behaviors service", () => {
    test("hace un GET a /club/behaviors y devuelve los datos", async () => {
        const mockBehaviors = [
            { id: "1", name: "Presión alta", code: "if (ball) press();" },
        ];
        // Mockeamos request general
        vi.spyOn(api, "request").mockResolvedValueOnce(mockBehaviors);

        const res = await getBehaviors();

        // Verificacion interaccion con endpoint correcto
        expect(api.request).toHaveBeenCalledWith("/club/behaviors", {
            method: "GET",
        });
        expect(res).toEqual(mockBehaviors);
    });
});

test("getBehaviorById hace un GET al endpoint del id", async () => {
    const mockData = { id: "1", name: "Ofensivo", code: "attack()" };
    vi.spyOn(api, "request").mockResolvedValueOnce(mockData);

    const result = await getBehaviorById("1");

    expect(api.request).toHaveBeenCalledWith("/club/behaviors/1", {
        method: "GET",
    });
    expect(result).toEqual(mockData);
});
