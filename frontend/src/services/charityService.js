import api from "./api";
export const getCharities = (params) => api.get("/charities", { params });
export const getCharity = (id) => api.get(`/charities/${id}`);
