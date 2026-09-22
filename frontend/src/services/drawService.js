import api from "./api";
export const getDraws = (params) => api.get("/draws", { params });
export const getDraw = (id) => api.get(`/draws/${id}`);
export const getMyDrawEntry = (drawId) => api.get(`/draw-entries/${drawId}/my`);
export const createDrawEntry = (drawId, data) => api.post(`/draw-entries/${drawId}`, data);
export const deleteDrawEntry = (drawId) => api.delete(`/draw-entries/${drawId}`);
