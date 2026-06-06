import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  login: (data) =>
    api.post("auth/login", data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }),
  register: (data) => api.post("auth/register", data),
  me: () => api.get("auth/me"),
};

export const taskService = {
  list: (params) => api.get("tasks", { params }),
  get: (id) => api.get(`tasks/${id}`),
  create: (data) => api.post("tasks", data),
  update: (id, data) => api.patch(`tasks/${id}`, data),
  remove: (id) => api.delete(`tasks/${id}`),
};

export const workspaceService = {
  list: (params) => api.get("workspaces", { params }),
  get: (id) => api.get(`workspaces/${id}`),
  create: (data) => api.post("workspaces", data),
  update: (id, data) => api.patch(`workspaces/${id}`, data),
  remove: (id) => api.delete(`workspaces/${id}`),
};

// Invite-only membership (backend increment #2)
export const invitationService = {
  // invitations the current user has received
  listMine: (params) => api.get("invitations", { params }),
  accept: (id) => api.post(`invitations/${id}/accept`),
  decline: (id) => api.post(`invitations/${id}/decline`),
  revoke: (id) => api.post(`invitations/${id}/revoke`),
  // invitations sent within a workspace (owner/admin)
  listForWorkspace: (workspaceId, params) =>
    api.get(`workspaces/${workspaceId}/invitations`, { params }),
  create: (workspaceId, data) =>
    api.post(`workspaces/${workspaceId}/invitations`, data),
};

export default api;
