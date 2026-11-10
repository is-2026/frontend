import { describe, it, expect, vi, beforeEach } from "vitest";
import { request } from "./api";
import { 
    cancelSubstitution, scheduleSubstitution, 
    changeLiveBehavior, setPenaltyOrder 
} from "./matches";

vi.mock("./api", () => ({
    request: vi.fn(),
}));

describe("changeLiveBehavior", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("hace PATCH al jugador del partido con behavior_id", async () => {
        request.mockResolvedValue(null); //null: esto devuelve una promesa resuelta exitosamente

        await changeLiveBehavior("m1", "p1", "b1");

        //verificación de que se llama a la ruta del match y player específico, con el método patch y el id del behavior nuevo en el cuerpo.
        expect(request).toHaveBeenCalledWith("/matches/m1/players/p1", {
            method: "PATCH",
            body: JSON.stringify({ behavior_id: "b1" }),
        });
    });

    it("propaga el error de request", async () => { //Verifica que devuelva error 400 si se eliminó el behavior
        const err = Object.assign(new Error("Comportamiento eliminado"), { status: 400 });
        request.mockRejectedValue(err); //simulamos error en request

        await expect(changeLiveBehavior("m1", "p1", "b1")).rejects.toBe(err); //el mensaje de response es rspuesta de error, se espera que changeLiveBehavior devuelva eso 
    });
});

describe("scheduleSubstitution", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("hace POST a las sustituciones del partido con quién sale, quién entra y el comportamiento", async () => {
        request.mockResolvedValue({ status: "pending" });

        await scheduleSubstitution("m1", "out1", "in1", "b1");

        expect(request).toHaveBeenCalledWith("/matches/m1/substitutions", {
            method: "POST",
            body: JSON.stringify({
                player_out_id: "out1",
                player_in_id: "in1",
                substitution_behavior_id: "b1",
            }),
        });
    });

    it("devuelve la sustitución que responde el servidor", async () => {
        // el panel usa res.status para saber si quedó pendiente o se ejecutó en el momento
        const substitution = {
            id: "s1",
            player_out_id: "out1",
            player_in_id: "in1",
            window: "halftime",
            status: "pending",
        };
        request.mockResolvedValue(substitution);

        const res = await scheduleSubstitution("m1", "out1", "in1", "b1");

        expect(res).toEqual(substitution);
    });
});

describe("cancelSubstitution", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("hace DELETE a la substitución planificada", async () => {
        request.mockResolvedValue(null);
        await cancelSubstitution('m1');
        expect(request).toHaveBeenCalledWith("/matches/m1/substitutions", {
            method: "DELETE",
        });
    });
});


describe("setPenaltyOrder", () => {
    const kickers = [
        { player_id: "p1", behavior_id: "b1" },
        { player_id: "p2", behavior_id: "b1" },
        { player_id: "p3", behavior_id: "b2" },
        { player_id: "p4", behavior_id: "b2" },
        { player_id: "p5", behavior_id: "b1" },
    ];

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("hace PUT de los pateadores", async () => {
        request.mockResolvedValue(null);

        await setPenaltyOrder("m1", kickers);

        expect(request).toHaveBeenCalledWith("/matches/m1/penalty-order", {
            method: "PUT",
            body: JSON.stringify({ kickers }),
        });
    });
});
