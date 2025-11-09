// frontend/src/api.js
// Simple API wrappers using fetch.
// Update BASE if your backend runs on a different port or host.

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function getJson(res) {
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json();
}

export default {
  async getShoutouts() {
    const res = await fetch(`${BASE}/shoutouts`);
    return getJson(res);
  },
  async createShoutout(payload) {
    const res = await fetch(`${BASE}/shoutouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return getJson(res);
  },
  async getLeaderboard() {
    const res = await fetch(`${BASE}/leaderboard`);
    return getJson(res);
  },
  async getDepartments() {
    const res = await fetch(`${BASE}/departments`);
    return getJson(res);
  },
  async getAdminInsights() {
    const res = await fetch(`${BASE}/admin/insights`);
    return getJson(res);
  },
};
