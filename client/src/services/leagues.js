import { request } from "./api";

// =========================================================================
// MOCK TEMPORAL DE LIGAS (Para probar flujo completo en el navegador)
// =========================================================================
const MOCK_LEAGUES_LIST = [
    {
        id: "123",
        name: "Liga Master de Primera",
        is_private: false,
        max_clubs: 10,
        registered_clubs: [
            { id: "c1", name: "FC Barcelona" },
            { id: "c2", name: "Real Madrid" },
        ],
    },
    {
        id: "456",
        name: "Liga Privada VIP",
        is_private: true,
        password: "123", // Contraseña para probar la liga privada
        max_clubs: 8,
        registered_clubs: [
            { id: "c3", name: "Boca Juniors" },
        ],
    },
];

/**
 * Crea una nueva liga.
 * @param {Object} data
 */
export function createLeagues(data) {
    console.log("Payload enviado a createLeagues:", data);
    return new Promise((resolve) => {
        setTimeout(() => resolve({ id: "liga-nueva-123", ...data }), 500);
    });

    // --- CÓDIGO REAL ---
    // return request("/leagues", {
    //     method: "POST",
    //     body: JSON.stringify(data),
    // });
}

/**
 * Obtiene todas las ligas o una específica si se pasa un leagueId.
 * @param {string} [leagueId]
 */
export async function getLeagues(leagueId) {
    // --- MOCK TEMPORAL ---
    return new Promise((resolve) => {
        setTimeout(() => {
            if (leagueId) {
                const league = MOCK_LEAGUES_LIST.find((l) => l.id === leagueId);
                resolve(league || null);
            } else {
                resolve(MOCK_LEAGUES_LIST);
            }
        }, 300);
    });

    // --- CÓDIGO REAL ---
    // return leagueId ? request(`/leagues/${leagueId}`) : request("/leagues");
}

/**
 * Obtiene el detalle de una liga específica por ID.
 * @param {string} leagueId
 */
export async function getLeagueById(leagueId) {
    return getLeagues(leagueId);
}

// Alias para mantener compatibilidad con otras vistas
export const getLeague = getLeagueById;

/**
 * Inscribe al club en una liga y valida la contraseña si es privada.
 * @param {string} leagueId
 * @param {Object} data
 */
export function joinLeague(leagueId, data) {
    // --- MOCK TEMPORAL ---
    console.log("Payload enviado a joinLeague:", data);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const league = MOCK_LEAGUES_LIST.find((l) => l.id === leagueId);

            // Validación mock de contraseña para ligas privadas
            if (league?.is_private && data?.password !== league.password) {
                reject({ status: 400, message: "La contraseña es incorrecta." });
                return;
            }

            resolve({ message: "Inscripto con éxito" });
        }, 500);
    });

    // --- CÓDIGO REAL ---
    // return request(`/leagues/${leagueId}/join`, {
    //     method: "POST",
    //     body: JSON.stringify(data),
    // });
}