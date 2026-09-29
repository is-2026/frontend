import { request } from "./api"; // Import de la función request de api. Ver archivo api.js


/**
 * Devuelve una lista con los amistosos disponibles
 */
export function getAmistosos() {
  return request("/amistosos");
}

/*
Esto es un mock para ver si funciona:
export function getAmistosos() {
  return Promise.resolve([
    { id: "1", nombre: "Amistoso de prueba", privado: false },
    { id: "2", nombre: "Amistoso privado", privado: true },
  ]);
}*/

/**
 * Crea lobby de un nuevo amistoso
 * @param {Object} body - { password?: string, jugadores: [{ jugador_id, es_titular, comportamiento_id? }] }
 * Requiere exactamente 6 jugadores (3 titulares y 3 suplentes).
 */
export function createAmistoso(data) {
  return request("/amistosos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Unirse a un amistoso disponible
 * @param {string} amistosoId - UUID del amistoso
 * @param {Object} data - { password?: string, jugadores: [{ jugador_id, es_titular, comportamiento_id? }] }
 * Requiere exactamente 6 jugadores (3 titulares y 3 suplentes).
 */
export function joinAmistoso(amistosoId, data) {
  return request(`/amistosos/${amistosoId}/unirse`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Elimina amistoso creado por el usuario (sólo si no tiene oponente)
 * @param {string} amistosoId - UUID del amistoso
 */
export function cancelAmistoso(amistosoId) {
  return request(`/amistosos/${amistosoId}`, {
    method: "DELETE",
  });
}