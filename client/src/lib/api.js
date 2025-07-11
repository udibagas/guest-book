import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5001") + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export async function getAll(endpoint, params = {}) {
  const { data } = await api.get(endpoint, { params });
  return data;
}

export async function getById(endpoint, id) {
  const { data } = await api.get(`${endpoint}/${id}`);
  return data;
}

export async function create(endpoint, payload) {
  const { data } = await api.post(endpoint, payload);
  return data;
}

export async function updateById(endpoint, id, payload) {
  const { data } = await api.put(`${endpoint}/${id}`, payload);
  return data;
}

export function deleteById(endpoint, id) {
  return api.delete(`${endpoint}/${id}`);
}

export default api;
