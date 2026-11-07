export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";
export const wsUrl = (path) =>
  `${WS_URL}${path}?token=${encodeURIComponent(localStorage.getItem("token") ?? "")}`;
export const MATCH_WS_PATH = (matchId) => `/ws/matches/${matchId}`;
export const FRIENDLY_LOBBY_WS_PATH = (friendlyId) => `/ws/friendlies/${friendlyId}/lobby`;
export const LEAGUE_LOBBY_WS_PATH = (leagueId) => `/ws/leagues/${leagueId}/lobby`;
export const FIELD_WIDTH = 40; //ancho en metros de la cancha
export const FIELD_HEIGHT = 20;
export const HALF_WIDTH = FIELD_WIDTH / 2;
export const HALF_HEIGHT = FIELD_HEIGHT / 2;
export const NEG_HALF_WIDTH = -HALF_WIDTH;
export const NEG_HALF_HEIGHT = -HALF_HEIGHT;