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
  // member endpoints (backend increment #2 — wired up but not yet live)
  members: (id) => api.get(`workspaces/${id}/members`),
  addMember: (id, data) => api.post(`workspaces/${id}/members`, data),
  updateMember: (id, userId, data) =>
    api.patch(`workspaces/${id}/members/${userId}`, data),
  removeMember: (id, userId) => api.delete(`workspaces/${id}/members/${userId}`),
};

export default api;
