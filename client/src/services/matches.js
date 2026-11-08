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


/**
 * Programa cambio de un titular por un suplente.
 * Se aplica en la siguiente pausa.
 * @param {string} match_id - UUID del partido
 * @param {string} player_out_id - UUID del titular que sale
 * @param {string} player_in_id - UUID del suplente que entra
 * @param {string} substitution_behavior_id - UUID del comportamiento del suplente
 */
export function scheduleSubstitution(match_id, player_out_id, player_in_id, substitution_behavior_id) {
    return request(`/matches/${match_id}/substitutions`, {
        method:"POST",
        body: JSON.stringify({ player_out_id, player_in_id, substitution_behavior_id }),
    });
}

export function cancelSubstitution(match_id) {
    return request(`/matches/${match_id}/substitutions`, {
        method:"DELETE",
    });
}

export function setPenaltyOrder(match_id) {
    return request(`/matches/${match_id}/penalty-order`, {
        method:"PUT",
    });
}


