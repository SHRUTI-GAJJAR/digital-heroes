import api from "./api";
export const loginUser = (email, password) => api.post("/auth/login", { email, password });
export const registerUser = (name, email, password) => api.post("/auth/register", { name, email, password });
export const getCurrentUser = () => api.get("/auth/me");
