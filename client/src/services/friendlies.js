import { request } from "./api"; // Import de la función request de api. Ver archivo api.js


/**
 Devuelve una lista con los amistosos disponibles
 export function getFriendlies() {
   return request("/friendlies");
 }
 */

//Esto es un mock para ver si funciona:
export function getFriendlies() {
    return Promise.resolve([
      { id: "1", nombre: "Amistoso de prueba", is_private: false },
      { id: "2", nombre: "Amistoso privado", is_private: true, password: "secretpass" },
    ]);
}
/*

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


export async function getFriendlyById(id) {
  const friendlies = await getFriendlies();
  return friendlies.find((f) => String(f.id) === String(id));
}

/**
 * Unirse a un amistoso disponible
 * @param {string} friendly_id - UUID del amistoso
 * @param {Object} data - { password?: string, players: [{ player_id, is_starter, behavior_id? }] }
 * Requiere exactamente 6 jugadores (3 titulares y 3 suplentes).
 */


/*
export function joinFriendly(friendly_id, data) {
  return request(`/friendlies/${friendly_id}/join`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function joinFriendly(friendlyId, data) {
  console.log("Payload enviado (MOCK):", { friendlyId, data });

  // Simulamos una demora de red de 1 segundo
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Opcional: Descomenta esto si quieres probar cómo se ve un error 409
  // throw { status: 409, message: "Tu club ya está inscripto" };

  return { success: true };
}
*/

export async function joinFriendly(friendlyId, body) {
  console.log("Enviando a API (MOCK):", { friendlyId, body });

  // Simula la latencia de red
  await new Promise((resolve) => setTimeout(resolve, 600));

  const friendly = await getFriendlyById(friendlyId);

  // Si es privado, simul la validación del backend
  if (friendly?.is_private) {
    if (body.password !== friendly.password) {
      // Simula una respuesta HTTP 400 Bad Request por contraseña incorrecta
      const error = new Error("La contraseña ingresada es incorrecta.");
      error.status = 400;
      throw error;
    }
  }

  return { success: true };
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