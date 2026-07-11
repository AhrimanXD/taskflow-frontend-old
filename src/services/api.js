import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

const TOKEN_KEY = "token";
const REFRESH_KEY = "refresh_token";

export function setTokens({ access_token, refresh_token } = {}) {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight token refresh: when the access token expires (401), swap it for
// a fresh one using the stored refresh token and replay the original request.
// Concurrent 401s share one refresh call. On refresh failure we clear tokens and
// signal the app to log out.
let refreshPromise = null;

async function refreshAccessToken() {
  const refresh_token = localStorage.getItem(REFRESH_KEY);
  if (!refresh_token) throw new Error("No refresh token");
  // Bare axios (not `api`) so this call skips the interceptors below.
  const res = await axios.post(`${api.defaults.baseURL}auth/refresh`, {
    refresh_token,
  });
  setTokens(res.data);
  return res.data.access_token;
}

const AUTH_PATHS = ["auth/login", "auth/register", "auth/refresh"];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { config, response } = error;
    const isAuthPath = AUTH_PATHS.some((p) => (config?.url ?? "").includes(p));
    if (!response || response.status !== 401 || config?._retry || isAuthPath) {
      throw error;
    }
    config._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccess = await refreshPromise;
      config.headers.Authorization = `Bearer ${newAccess}`;
      return api(config);
    } catch {
      clearTokens();
      window.dispatchEvent(new Event("tf-auth-expired"));
      throw error;
    }
  }
);

export const authService = {
  login: (data) =>
    api.post("auth/login", data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }),
  register: (data) => api.post("auth/register", data),
  refresh: (refresh_token) => api.post("auth/refresh", { refresh_token }),
  me: () => api.get("auth/me"),
  updateMe: (data) => api.patch("auth/me", data),
  changePassword: (data) => api.post("auth/change-password", data),
};

// Personal tasks (/api/tasks — owner-scoped, no workspace)
export const taskService = {
  list: (params) => api.get("tasks", { params }),
  get: (id) => api.get(`tasks/${id}`),
  create: (data) => api.post("tasks", data),
  update: (id, data) => api.patch(`tasks/${id}`, data),
  remove: (id) => api.delete(`tasks/${id}`),
};

// Workspace tasks (/api/workspaces/{id}/tasks — membership-scoped, backend #3)
export const workspaceTaskService = {
  list: (workspaceId, params) =>
    api.get(`workspaces/${workspaceId}/tasks`, { params }),
  get: (workspaceId, id) => api.get(`workspaces/${workspaceId}/tasks/${id}`),
  create: (workspaceId, data) =>
    api.post(`workspaces/${workspaceId}/tasks`, data),
  update: (workspaceId, id, data) =>
    api.patch(`workspaces/${workspaceId}/tasks/${id}`, data),
  remove: (workspaceId, id) =>
    api.delete(`workspaces/${workspaceId}/tasks/${id}`),
};

export const workspaceService = {
  list: (params) => api.get("workspaces", { params }),
  get: (id) => api.get(`workspaces/${id}`),
  create: (data) => api.post("workspaces", data),
  update: (id, data) => api.patch(`workspaces/${id}`, data),
  remove: (id) => api.delete(`workspaces/${id}`),
  // [{ user_id, role, user: { id, username } }] — backend #2 members endpoint
  members: (id, params) => api.get(`workspaces/${id}/members`, { params }),
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
