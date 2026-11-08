import { request } from "./api";

// devuelve el ranking global de clubes (solo ligas públicas)
/* export function getRanking() {
    return request("/ranking", {
        method: "GET",
    });
} */

// MOCK para ver funcionamiento del ranking
export function getRanking() {
  return Promise.resolve([
    { position: 1, club_id: "c1", club_name: "River", avatar_url: "https://placehold.co/150x150/png?text=River", points: 15, matches_played: 6, won: 4, won_penalties: 1, drawn: 1, lost: 0, goals_for: 14, goals_against: 4 },
    { position: 2, club_id: "c2", club_name: "Boca", avatar_url: "https://placehold.co/150x150/png?text=Boca", points: 12, matches_played: 6, won: 3, won_penalties: 1, drawn: 1, lost: 1, goals_for: 10, goals_against: 7 },
    { position: 3, club_id: "c3", club_name: "Independiente", avatar_url: "https://placehold.co/150x150/png?text=Rojo", points: 7, matches_played: 6, won: 2, won_penalties: 0, drawn: 1, lost: 3, goals_for: 6, goals_against: 9 },
    { position: 4, club_id: "c4", club_name: "Racing", avatar_url: "https://placehold.co/150x150/png?text=Racing", points: 2, matches_played: 6, won: 0, won_penalties: 0, drawn: 2, lost: 4, goals_for: 3, goals_against: 13 },
  ]);
}