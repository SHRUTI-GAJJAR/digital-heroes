import api from "./api";
export const getSubscriptions = () => api.get("/subscriptions");
export const getSubscription = (id) => api.get(`/subscriptions/${id}`);
export const createSubscription = (data) => api.post("/subscriptions", data);
export const updateSubscription = (id, data) => api.put(`/subscriptions/${id}`, data);
export const cancelSubscription = (id) => api.patch(`/subscriptions/${id}/cancel`);
