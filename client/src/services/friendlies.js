import { request } from "./api"; // Import de la función request de api. Ver archivo api.js


/**
 Devuelve una lista con los amistosos disponibles
 */

export function getFriendlies() {
  return request("/friendlies");
}

/*
//Esto es un mock para ver si funciona:
export function getFriendlies() {
    return Promise.resolve([
      { id: "1", nombre: "Amistoso de prueba", is_private: false, creator_club_id: "1" },
      { id: "2", nombre: "Amistoso privado", is_private: true, password: "secretpass", creator_club_id: "3" },
    ]);
}
*/
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

/* MOCK para ver funcionamiento de crear amistoso 
export function createFriendlies(data) {
  console.log("Payload recibido en createFriendlies (MOCK):", data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "friendly-123-abc",
        status: "waiting",
        is_private: Boolean(data.password),
      });
    }, 800); // Simula 800ms de latencia de red
  });
}
*/
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

export function joinFriendly(friendly_id, data) {
  return request(`/friendlies/${friendly_id}/join`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/*
//Mock para verificar que funciona la validación de password
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
*/

/**
 * Elimina amistoso creado por el usuario (sólo si no tiene oponente)
 * @param {string} friendly_id - UUID del amistoso
 */
export function cancelfriendly(friendly_id) {
  return request(`/friendlies/${friendly_id}`, {
    method: "DELETE",
  });
}