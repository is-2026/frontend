import { API_URL } from "../config";

export async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Manejo de respuestas sin cuerpo JSON (ej. HTTP 204 No Content)
  }

  if (!res.ok) {
    const error = new Error(data?.detail ?? data?.message ?? "Error inesperado del servidor");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}