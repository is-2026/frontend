import { API_URL } from "../config"; //en config estará la URL de la API.

export async function request(path, options = {}) {// Función request recibe path y config adicionales en options
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, { // Espera un fetch de la URL combinada de la API con el path.
    //Ejemplo: https://api.game.com/v1/friendlies. API_URL será lo que va hasta el .com y lo otro es el path
    
    ...options, //el segundo parámetro de la función es una configuración adicional, como por ej method: 'POST'
    
    headers: { "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers, 
    }, 
  });// Este fetch se guarda en res, que será la respuesta del servidor.

  let data = null;
  try {
    data = await res.json(); // Espera a que se descargue el texto enviado por la API, e intenta convertirlo de JSON a un objeto de javascript
  } catch {
    // Algunas respuestas (ej. 204) no traen body
    // En esos casos, data queda en null sin tirar error
  }

  if (!res.ok) {//res.ok es true si es una respuesta de éxito (respuesta tipo 200). Si responde con error (400 o 500), es false.
    const error = new Error(data?.detail ?? data?.message ?? "Error inesperado del servidor");
    error.status = res.status;
    error.data = data;
    throw error;
  }
  // el ?. evita que la app falle si se intenta leer la propiedad de algo null o undefined.
  //  data?.detail: si data existe, lee la propiedad detail. Si data es null, devuelve undefined.
  // y ?? evalua de izquierda a derecha y se queda con el primer valor que no es null o undefined. Si detail ni message son definidos, 
  // manda el mensaje "Error inesperado del servidor"
  return data;
}
