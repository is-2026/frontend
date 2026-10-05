import { request } from "./api";
/**
 * Crea lobby de una nueva liga
 * @param {Object} data - {name: string, 
 *                         password?: string,
 *                         max_clubs: number,
 *                         match_duration_minutes: number, 
 *                         players: [{ player_id, is_starter, behavior_id? }] }
 * Requiere exactamente 6 jugadores (3 titulares y 3 suplentes).
 */

export function createLeagues(data) {
  return request("/leagues", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getLeagues(leagueId) {
  return request(`/leagues/${leagueId}`);
}