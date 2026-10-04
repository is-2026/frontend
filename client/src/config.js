export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080";

export const MATCH_WS_PATH = (matchId) => `/ws/matches/${matchId}`;
export const FRIENDLY_LOBBY_WS_PATH = (friendlyId) => `/ws/friendlies/${friendlyId}/lobby`;