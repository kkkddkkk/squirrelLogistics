
export const api = {
    async listUsers({ q = "", page = 0, size = 10 }) {
        const r = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);
        return r.json();
    },
    async createUser(body) { const r = await fetch(`/api/admin/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
    async updateUser(id, body) { const r = await fetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
    async deleteUser(id) { await fetch(`/api/admin/users/${id}`, { method: "DELETE" }); },

    async listVehicles({ q = "", page = 0, size = 10 }) {
        const r = await fetch(`/api/admin/vehicles?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);
        return r.json();
    },
    async createVehicle(body) { const r = await fetch(`/api/admin/vehicles`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
    async updateVehicle(id, body) { const r = await fetch(`/api/admin/vehicles/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
    async deleteVehicle(id) { await fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" }); },
};
