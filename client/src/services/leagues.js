import { request } from "./api";

/**
 * Devuelve la lista de ligas disponibles
 */
export function getLeagues() {
  return request("/ligas");
}