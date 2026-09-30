export const registrarUsuario = async (email, password) => {
  const res = await fetch('/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw { status: res.status };
  }
  
  return await res.json();
};