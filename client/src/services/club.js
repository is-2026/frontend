import { request } from "./api" // hago un import de la funcion api.js

// Exporto una constante para el avatar por defecto. Usamos esa url para generar un avatar temporal.
export const DEFAULT_AVATAR = "https://placehold.co/150x150/png?text=Club";

/**
 * Petición para crear un club (POST /club)
 * @param {Object} data
 */

// =========================================================================
// MOCK TEMPORAL (Para probar funcionamiento).
// =========================================================================
/*export function createClub(data) {
  const { club_name, avatar_url } = data;
  console.log("Mock createClub recibido:", { club_name, avatar_url });

  // Simula un delay de 800ms para que veas el botón en estado "Creando club..."
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "123-club-fake",
        club_name: club_name,
        avatar_url: avatar_url?.trim() ? avatar_url : DEFAULT_AVATAR,
      });
    }, 800);
  });
}
*/

export function createClub(data) {
    const {club_name, avatar_url } = data;
    
    return request("/club", {
        method: "POST",
        body: JSON.stringify({
            club_name,
            avatar_url: avatar_url?.trim() ? avatar_url : DEFAULT_AVATAR,
        }),
    });
}

/**
 * Petición para crear un jugador en la plantilla (POST /club/players)
 * @param {Object} data
 */
export function createPlayer(data) {
  return request("/club/players", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      number: data.number,
      power: data.power,
      agility: data.agility,
      control: data.control,
      speed: data.speed,
      strength: data.strength,
    }),
  });
}
