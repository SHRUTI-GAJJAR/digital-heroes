import api from "./api";
export const getDonations = () => api.get("/donations");
export const getDonation = (id) => api.get(`/donations/${id}`);
export const createDonation = (data) => api.post("/donations", data);
