const technicalCopy = /backend|endpoint|database|frontend|implementation|api error|api response|network error|request failed with status|axios|econnrefused|sql /i;

export const apiMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const fromServer = error?.response?.data?.message;
  if (fromServer && !technicalCopy.test(String(fromServer))) return fromServer;
  const fromClient = error?.message;
  if (fromClient && !error?.response && !technicalCopy.test(String(fromClient))) return fromClient;
  return fallback;
};

export const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
};

export const formatDrawMonth = (value) => {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 7)}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(date);
};

export const statusLabel = (value) => value ? String(value).replaceAll("_", " ") : "Unavailable";

export const currencyValue = (amount, currency) => {
  if (amount === null || amount === undefined || amount === "") return null;
  try { return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency || "GBP" }).format(Number(amount)); }
  catch { return `${amount}${currency ? ` ${currency}` : ""}`; }
};
