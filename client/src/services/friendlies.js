import { request } from "./api"; // Import de la función request de api. Ver archivo api.js


/**
 Devuelve una lista con los amistosos disponibles
 */
export function getFriendlies() {
  return request("/friendlies");
}

/*
Esto es un mock para ver si funciona:
export function getFriendlies() {
    return Promise.resolve([
      { id: "1", nombre: "Amistoso de prueba", is_private: false },
      { id: "2", nombre: "Amistoso privado", is_private: true },
    ]);
}

Simulación de error para ver mensaje de error
export function getFriendlies() {
  // Simula una respuesta de error 400 Bad Request o 500 del backend
  return Promise.reject(new Error("Error 400: El usuario no tiene un club asignado."));
}
*/

/**
 * Crea lobby de un nuevo amistoso
 * @param {Object} data - { password?: string, players: [{ player_id, is_starter, behavior_id? }] }
 * Requiere exactamente 6 jugadores (3 titulares y 3 suplentes).
 */
export function createFriendlies(data) {
  return request("/friendlies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Unirse a un amistoso disponible
 * @param {string} friendly_id - UUID del amistoso
 * @param {Object} data - { password?: string, players: [{ player_id, is_starter, behavior_id? }] }
 * Requiere exactamente 6 jugadores (3 titulares y 3 suplentes).
 */
export function joinFriendlies(friendly_id, data) {
  return request(`/friendlies/${friendly_id}/join`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Elimina amistoso creado por el usuario (sólo si no tiene oponente)
 * @param {string} friendly_id - UUID del amistoso
 */
export function cancelfriendly(friendly_id) {
  return request(`/friendlies/${friendly_id}`, {
    method: "DELETE",
  });
}