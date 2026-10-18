import { request } from "./api";

/**
 * Crea una nueva liga.
 * @param {Object} data - Datos de configuración de la liga y alineación inicial.
 */
export function createLeagues(data) {
    return request("/leagues", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * Obtiene el listado de todas las ligas disponibles o el detalle de una por ID.
 * @param {string} [leagueId]
 */
export function getLeagues(leagueId) {
    return leagueId ? request(`/leagues/${leagueId}`) : request("/leagues");
}

/**
 * Obtiene el detalle de una liga específica por ID.
 * @param {string} leagueId
 */
export function getLeagueById(leagueId) {
    return request(`/leagues/${leagueId}`);
}

/**
 * Inscribe al club en una liga (soporta ligas públicas y privadas).
 * @param {string} leagueId
 * @param {Object} data - Datos de alineación y contraseña (si es privada).
 */
export function joinLeague(leagueId, data) {
    return request(`/leagues/${leagueId}/join`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function leaveLeague(leagueId) {
    return request(`/leagues/${leagueId}/join`, {
        method: "DELETE",
    });
}

export async function startLeague(leagueId) {
    return await request(`/leagues/{leagueId}/start`, {
        method: "POST",
    });
}