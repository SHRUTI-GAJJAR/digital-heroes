import api from "./api";
export const getSubscriptions = () => api.get("/subscriptions");
export const getSubscription = (id) => api.get(`/subscriptions/${id}`);
export const initiateSubscriptionPayment = (data) => api.post("/payments/payu/initiate", data);
export const updateSubscription = (id, data) => api.put(`/subscriptions/${id}`, data);
export const cancelSubscription = (id) => api.patch(`/subscriptions/${id}/cancel`);
