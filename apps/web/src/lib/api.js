export class ApiError extends Error {
  status;
  details;
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
async function request(path, init = {}) {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      json.error?.message ?? "Something went wrong.",
      response.status,
      json.error?.details,
    );
  return json.data;
}
export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
