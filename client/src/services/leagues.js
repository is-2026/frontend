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
 * Obtiene el listado de todas las ligas disponibles.
 * @param {string} [name] - filtro opcional por nombre
 */
export function getLeagues(clubName = "") {
    const cleanName = clubName.trim();
    const endpoint = cleanName 
        ? `/leagues?name=${encodeURIComponent(cleanName)}` 
        : `/leagues`;
    return(request(endpoint));
} 
//EncodeURIComponent evita que la búsqueda falle o se rompa la URL 
//si el usuario tipea espacios, tildes o símbolos en el campo de texto.

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
    return await request(`/leagues/${leagueId}/start`, {
        method: "POST",
    });
}

// funcion que devuelve partidos de la liga
export function getLeagueMatches(leagueId) {
    return request(`/leagues/${leagueId}/matches`, { 
        method: "GET",
    });
}

// funcion que devuelve las posiciones de la liga, un array de la tabla
export function getStandings(leagueId) {
    return request(`/leagues/${leagueId}/standings`, {
        method: "GET",
    });
}

// devuelve las ligas en las que participa mi club
export function getMyLeagues() {
    return request("/club/leagues", {
        method: "GET",
    });
}

// devuelve mi alinación vigente en la liga
export function getLineup(leagueId) {
    return request(`/leagues/${leagueId}/lineup`, {
        method: "GET",
    });
}

// guarda mi alineación en la liga
export function updateLineup(leagueId, data) {
    return request(`/leagues/${leagueId}/lineup`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// cancela la liga no iniciada (solo el creador)
export function cancelLeague(leagueId) {
    return request(`/leagues/${leagueId}`, {
        method: "DELETE",
    });
}