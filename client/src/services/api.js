import { API_URL } from "../config";

export async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json", // avisa al backend que el formato es en json
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // si el token existe, le agrega la autorizacion
    ...options.headers, // si exite el options, mezcla con otro encabezado que le pasas en options
  };

  // realizamos la petidicon de la url base de la api con el path las rutas
  // el await nos sirve para esprar repuesta del sv
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

  if (!res.ok) {           // busca el mensaje de la api en deatil o message
    const error = new Error(data?.detail ?? data?.message ?? "Error inesperado del servidor");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}