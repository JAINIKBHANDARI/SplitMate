import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "/api";
const baseURL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.status = status;
    this.details = details;
    this.fieldErrors = Array.isArray(details) ? details : [];
  }
}

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15_000,
});

let refreshPromise = null;

const normalizeError = (error) => {
  if (error instanceof ApiError) return error;
  const response = error.response;
  if (!response)
    return new ApiError("Network error. Check your connection.", 0);
  const message =
    response.data?.message ??
    response.data?.error?.message ??
    "Something went wrong.";
  const details =
    response.data?.errors ??
    response.data?.error?.errors ??
    response.data?.error?.details ??
    [];
  return new ApiError(
    message,
    response.status,
    details,
  );
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isRefresh = original?.url?.includes("/auth/refresh");
    const isPublicAuth = [
      "/auth/login",
      "/auth/signup",
      "/auth/forgot-password",
      "/auth/reset-password",
    ].some((path) => original?.url?.includes(path));
    if (status !== 401 || original?._retry || isRefresh || isPublicAuth) {
      throw normalizeError(error);
    }
    original._retry = true;
    try {
      refreshPromise ??= apiClient.post("/auth/refresh").finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
      return apiClient(original);
    } catch (refreshError) {
      if (window.location.pathname.startsWith("/app"))
        window.location.assign("/login");
      throw normalizeError(refreshError);
    }
  },
);

async function unwrap(promise) {
  try {
    const response = await promise;
    return response.data?.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export const api = {
  get: (path, config) => unwrap(apiClient.get(path, config)),
  post: (path, body, config) => unwrap(apiClient.post(path, body, config)),
  patch: (path, body, config) => unwrap(apiClient.patch(path, body, config)),
  delete: (path, config) => unwrap(apiClient.delete(path, config)),
  upload: (path, formData, onUploadProgress) =>
    unwrap(
      apiClient.post(path, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      }),
    ),
};
