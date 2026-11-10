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

/*export function getPlayers(data) {
  return request("/club/players", {
    method: "GET",
  });
}
*/

/* MOCK para ver funcionamiento de crear amistoso.
export function getPlayers() {
  return Promise.resolve([
    { id: "p1", name: "Lionel Messi", number: 10, power: 95 },
    { id: "p2", name: "Julián Álvarez", number: 9, power: 88 },
    { id: "p3", name: "Ángel Di María", number: 11, power: 89 },
    { id: "p4", name: "Rodrigo De Paul", number: 7, power: 85 },
    { id: "p5", name: "Alexis Mac Allister", number: 20, power: 84 },
    { id: "p6", name: "Enzo Fernández", number: 24, power: 86 },
    { id: "p7", name: "Emiliano Martínez", number: 23, power: 90 },
  ]);
}
*/

export async function getPlayers() {
  return request("/club/players");
}

export function getMyClub() {
    return request("/club");
}

export const updateDtBehavior = async (coach_behavior_id) => {
    return await request(`/club/coach`, {
        method: 'PATCH',
        body: JSON.stringify({ behavior_id: coach_behavior_id })
    });
};

export function getClubInfo(club_Id) {
    return request(`/clubs/${club_Id}`);
}
