import { request } from "./api"; 


/**
 * Cambia el comportamiento de un jugador durante el partido.
 * Se aplica desde el siguiente tick del simulador.
 * @param {string} match_id - UUID del partido
 * @param {string} player_id - UUID del jugador
 * @param {string} behavior_id - UUID del nuevo comportamiento
 */
export function changeLiveBehavior(match_id, player_id, behavior_id) {
    return request(`/matches/${match_id}/players/${player_id}`, {
        method:"PATCH",
        body: JSON.stringify({ behavior_id }),
    });
}