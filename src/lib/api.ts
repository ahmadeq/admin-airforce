import axios from "axios";

// Get JWT from cookies
export function getToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Set JWT in cookies
export function setToken(token: string) {
  if (typeof document !== "undefined") {
    document.cookie = `token=${encodeURIComponent(token)}; path=/;`;
  }
}

// Remove JWT and redirect to login
export function logout() {
  if (typeof document !== "undefined") {
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/login";
  }
}

// Axios instance with 401 handling
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);
