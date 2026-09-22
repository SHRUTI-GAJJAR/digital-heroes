import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically to protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("digitalHeroesToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle common authentication errors
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("digitalHeroesToken");
      localStorage.removeItem("digitalHeroesUser");
      window.dispatchEvent(new Event("digitalheroes:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;
