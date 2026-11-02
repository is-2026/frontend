import { describe, test, it, expect, vi, beforeEach } from "vitest";
  import { request } from "./api";
  import { createLeagues, getLeagues, getLeagueById, joinLeague , leaveLeague, startLeague, getLeagueMatches, getStandings, getLineup, updateLineup } from "./leagues";

  vi.mock("./api", () => ({
      request: vi.fn(),
  }));

  describe("leagues service", () => {
      beforeEach(() => {
          vi.resetAllMocks();
      });

      describe("getLeagues", () => {
          test("debe retornar la lista de ligas cuando la petición es exitosa", async () => {
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
                        registered_clubs: [{ club_id: "c2", club_name: "Club 2" }, { club_id: "c3", club_name: "Club 3" }],
                },
            ];

            request.mockResolvedValueOnce(mockLeagues);

            const result = await getLeagues();

            expect(request).toHaveBeenCalledWith("/leagues");
            expect(result).toEqual(mockLeagues);
            expect(result.length).toBe(2);
        });

        test("debe lanzar un error cuando el backend responde con error", async () => {
            const errorMessage = "Error 400: Bad Request";
            request.mockRejectedValueOnce(new Error(errorMessage));

            await expect(getLeagues()).rejects.toThrow(errorMessage);
        });
    });

    describe("createLeagues", () => {
        test("ante una respuesta 201, debe enviar el payload a /leagues y retornar la liga creada", async () => {
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

            const mockResponse = { id: "liga-123", status: "No iniciada" };
            request.mockResolvedValueOnce(mockResponse);

            const result = await createLeagues(mockData);

            expect(request).toHaveBeenCalledWith("/leagues", {
                method: "POST",
                body: JSON.stringify(mockData),
            });
            expect(result).toEqual(mockResponse);
        });

        test("ante una respuesta 400, debe lanzar un error con el status correspondiente", async () => {
            const mockError = new Error("Datos inválidos");
            mockError.status = 400;

            request.mockRejectedValueOnce(mockError);

            await expect(createLeagues({})).rejects.toThrow("Datos inválidos");
        });
    });

    describe("getLeague", () => {
        test("obtiene el detalle de la liga por el id consultado usando getLeagues", async () => {
            const mockLeague = {
                id: "123",
                name: "Liga del ChiquiMafia",
                max_clubs: 30,
                registered_clubs: [],
            };

            request.mockResolvedValueOnce(mockLeague);
            const result = await getLeagues("123");

            expect(request).toHaveBeenCalledWith("/leagues/123");
            expect(result).toEqual(mockLeague);
        });

        test("obtiene el detalle de la liga usando getLeagueById", async () => {
            const mockLeague = {
                id: "123",
                name: "Liga del ChiquiMafia",
                max_clubs: 30,
                registered_clubs: [],
            };

            request.mockResolvedValueOnce(mockLeague);
            const result = await getLeagueById("123");

            expect(request).toHaveBeenCalledWith("/leagues/123");
            expect(result).toEqual(mockLeague);
        });

        test("da error si la liga no existe o la API falla", async () => {
            request.mockRejectedValueOnce(new Error("Liga no encontrada"));

            await expect(getLeagues("999")).rejects.toThrow("Liga no encontrada");
        });
    });

    describe("joinLeague", () => {
        test("debe enviar el payload a /leagues/:id/join correctamente", async () => {
            const leagueId = "liga-123";
            const mockPayload = {
                password: "secret",
                players: [
                    { player_id: "p1", is_starter: true },
                    { player_id: "p2", is_starter: true },
                    { player_id: "p3", is_starter: true },
                    { player_id: "p4", is_starter: false },
                    { player_id: "p5", is_starter: false },
                    { player_id: "p6", is_starter: false },
                ]
            };

            const mockResponse = { message: "Club inscripto exitosamente" };
            request.mockResolvedValueOnce(mockResponse);

            const result = await joinLeague(leagueId, mockPayload);

            expect(request).toHaveBeenCalledWith(`/leagues/${leagueId}/join`, {
                method: "POST",
                body: JSON.stringify(mockPayload),
            });
            expect(result).toEqual(mockResponse);
        });

        test("debe propagar los errores de la API", async () => {
            const mockError = new Error("El club ya esta inscripto en la liga");
            mockError.status = 409;

            request.mockRejectedValueOnce(mockError);

            await expect(joinLeague("liga-123", {})).rejects.toThrow("El club ya esta inscripto en la liga");
        });
    });

    describe("leaveLeague", () => {
        test("debe enviar la petición a /leagues/:id/join con método DELETE exitosamente", async () => {
            const leagueId = "liga-123";
            const mockResponse = { message: "Inscripción eliminada" };
            request.mockResolvedValueOnce(mockResponse);

            const result = await leaveLeague(leagueId);

            expect(request).toHaveBeenCalledWith(`/leagues/${leagueId}/join`, {
                method: "DELETE",
            });
            expect(result).toEqual(mockResponse);
        });

        test("debe propagar los errores si la API falla", async () => {
            const mockError = new Error("La liga indicada no existe, o el club no está inscripto en ella");
            mockError.status = 404;

            request.mockRejectedValueOnce(mockError);

            await expect(leaveLeague("liga-123")).rejects.toThrow("La liga indicada no existe, o el club no está inscripto en ella");
        });
    });

    describe("startLeague", () => {
        test("debe enviar la peticion POST correctamente a /leagues/:id/start", async () => {
            const leagueId = "liga-123";
            const mockResponse = { id: "liga-123", status: "started", is_started: true };
            request.mockResolvedValueOnce(mockResponse);

            const result = await startLeague(leagueId);

            expect(result).toEqual(mockResponse);
        });

        test("debe propagar los errores si la API falla", async () => {
            const mockError = new Error("Se necesitan al menos 3 clubes para iniciar la liga");
            mockError.status = 400;

            request.mockRejectedValueOnce(mockError);

            await expect(startLeague("Liga-123")).rejects.toThrow("Se necesitan al menos 3 clubes para iniciar la liga");
        });
    });

    describe("getLeagueMatches", () => {
        test("debe pedir los partidos a /leagues/:id/matches y retornarlos", async () => {
            const mockMatches = [
                { id: "m1", home_club_id: "c1", away_club_id: "c2", status: "finished", home_score: 2, away_score: 1 },
                { id: "m2", home_club_id: "c3", away_club_id: "c1", status: "scheduled", home_score: null, away_score: null },
            ];
            request.mockResolvedValueOnce(mockMatches);

            const result = await getLeagueMatches("liga-123");

            expect(request).toHaveBeenCalledWith("/leagues/liga-123/matches", { method: "GET"});
            expect(result).toEqual(mockMatches);
        });

        test("debe propagar el error si la liga aun no fue iniciada", async () => {
            const mockError = new Error("La liga aún no fue iniciada");
            mockError.status = 409;
            request.mockRejectedValueOnce(mockError);

            await expect(getLeagueMatches("liga-123")).rejects.toThrow("La liga aún no fue iniciada");
        });
    });

    describe("getStandings", () => {
        test("debe pedir la tabla a /leagues/:id/standings y retornarla", async () => {
            const mockStandings = [
                { club_id: "c1", club_name: "Club 1", points: 6, matches_played: 2, won: 2, drawn: 0, lost: 0, goals_for: 4, goals_against: 1 },
                { club_id: "c2", club_name: "Club 2", points: 0, matches_played: 2, won: 0, drawn: 0, lost: 2, goals_for: 1, goals_against: 4 },
            ];
            request.mockResolvedValueOnce(mockStandings);

            const result = await getStandings("liga-123");

            expect(request).toHaveBeenCalledWith("/leagues/liga-123/standings", { method: "GET"});
            expect(result).toEqual(mockStandings);
        });

        test("debe propagar el error si la liga no existe", async () => {
            const mockError = new Error("La liga no existe");
            mockError.status = 404;
            request.mockRejectedValueOnce(mockError);

            await expect(getStandings("liga-123")).rejects.toThrow("La liga no existe");
        });
    });

    describe("getLineup", () => {
        test("debe pedir GET /leagues/:id/lineup y retornar la alineación", async () => {
            const mockLineup = { formation: "TRIANGLE", players: []};
            request.mockResolvedValueOnce(mockLineup);

            const result = await getLineup("L1");

            expect(request).toHaveBeenCalledWith("/leagues/L1/lineup", { method: "GET" });
            expect(result).toEqual(mockLineup);
        });
    });

    describe("updateLineup", () => {
        test("debe enviar PUT /leagues/:id/lineup con el body", async () => {
            const data = { formation: "TRIANGLE", players: [] };
            request.mockResolvedValueOnce(data);

            await updateLineup("l1", data);

            expect(request).toHaveBeenCalledWith("/leagues/l1/lineup", {
                method: "PUT",
                body: JSON.stringify(data),
            });
        });
    });
});