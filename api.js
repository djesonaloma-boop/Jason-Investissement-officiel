const API_URL = "http://localhost:3000/api";

async function apiRequest(path, options = {}) {
  const res = await fetch(API_URL + path, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers||{}) }
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.message || "Erreur serveur");
  return data;
}