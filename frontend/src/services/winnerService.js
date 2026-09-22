import api from "./api";
export const getWinners = () => api.get("/winners");
export const getWinner = (id) => api.get(`/winners/${id}`);
export const uploadWinnerProof = (id, formData) => api.post(`/winners/${id}/proof`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const getWinnerProof = (id) => api.get(`/winners/${id}/proof`);
