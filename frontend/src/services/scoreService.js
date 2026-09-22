import api from "./api";
export const getScores = () => api.get("/scores");
export const getScore = (id) => api.get(`/scores/${id}`);
export const createScore = (data) => api.post("/scores", data);
export const updateScore = (id, data) => api.put(`/scores/${id}`, data);
export const deleteScore = (id) => api.delete(`/scores/${id}`);
