const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  list: () => fetch(`${BASE}/portfolios`).then(handle),
  get: (id) => fetch(`${BASE}/portfolios/${id}`).then(handle),
  create: (data) =>
    fetch(`${BASE}/portfolios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),
  update: (id, data) =>
    fetch(`${BASE}/portfolios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),
  remove: (id) => fetch(`${BASE}/portfolios/${id}`, { method: "DELETE" }).then(handle),
  generateBio: (data) =>
    fetch(`${BASE}/ai/generate-bio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),
};
