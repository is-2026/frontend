import { request } from "./api" // hago un import de la funcion api.js

// Exporto una constante para el avatar por defecto. Usamos esa url para generar un avatar temporal.
export const DEFAULT_AVATAR = "https://via.placeholder.com/150?text=Club";

/**
 * Petición para crear un club (POST /club)
 * @param {Object} params
 * @param {string} params.club_name - Nombre del club
 * @param {string} [params.avatar_url] - URL del avatar
 */

export function createClub(data) {
    return request("/club", {
        method: "POST",
        body: JSON.stringify({
            club_name,
            avatar_url: avatar_url?.trim() ? avatar_url : DEFAULT_AVATAR,
        }),
    });
}

