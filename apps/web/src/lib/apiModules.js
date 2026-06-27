import { api } from "./api";

export const authApi = {
  me: () => api.get("/auth/me"),
  login: (body) => api.post("/auth/login", body),
  signup: (body) => api.post("/auth/signup", body),
  logout: () => api.post("/auth/logout"),
  logoutAll: () => api.post("/auth/logout-all"),
  forgotPassword: (body) => api.post("/auth/forgot-password", body),
  resetPassword: (body) => api.post("/auth/reset-password", body),
  changePassword: (body) => api.post("/auth/change-password", body),
};

export const userApi = {
  updateMe: (body) => api.patch("/users/me", body),
};

export const groupsApi = {
  list: () => api.get("/groups"),
  create: (body) => api.post("/groups", body),
  detail: (groupId) => api.get(`/groups/${groupId}`),
  update: (groupId, body) => api.patch(`/groups/${groupId}`, body),
  archive: (groupId, body) => api.post(`/groups/${groupId}/archive`, body),
};

export const membersApi = {
  invite: (groupId, body) => api.post(`/groups/${groupId}/members`, body),
  addGuest: (groupId, body) =>
    api.post(`/groups/${groupId}/members/guest`, body),
  updateRole: (groupId, membershipId, body) =>
    api.patch(`/groups/${groupId}/members/${membershipId}`, body),
  remove: (groupId, membershipId) =>
    api.delete(`/groups/${groupId}/members/${membershipId}`),
};

export const invitationsApi = {
  preview: (token) => api.get(`/groups/invitations/${token}/preview`),
  accept: (token) => api.post(`/groups/join/${token}`),
  list: (groupId) => api.get(`/groups/${groupId}/invitations`),
  revoke: (groupId, invitationId) =>
    api.post(`/groups/${groupId}/invitations/${invitationId}/revoke`),
};

export const expensesApi = {
  list: (groupId, config) => api.get(`/groups/${groupId}/expenses`, config),
  create: (groupId, body) => api.post(`/groups/${groupId}/expenses`, body),
  update: (groupId, expenseId, body) =>
    api.patch(`/groups/${groupId}/expenses/${expenseId}`, body),
  remove: (groupId, expenseId) =>
    api.delete(`/groups/${groupId}/expenses/${expenseId}`),
};

export const recurringApi = {
  list: (groupId) => api.get(`/groups/${groupId}/recurring`),
  create: (groupId, body) => api.post(`/groups/${groupId}/recurring`, body),
  update: (groupId, recurringId, body) =>
    api.patch(`/groups/${groupId}/recurring/${recurringId}`, body),
  remove: (groupId, recurringId) =>
    api.delete(`/groups/${groupId}/recurring/${recurringId}`),
};

export const budgetsApi = {
  list: (groupId) => api.get(`/groups/${groupId}/budgets`),
  create: (groupId, body) => api.post(`/groups/${groupId}/budgets`, body),
  update: (groupId, budgetId, body) =>
    api.patch(`/groups/${groupId}/budgets/${budgetId}`, body),
  remove: (groupId, budgetId) =>
    api.delete(`/groups/${groupId}/budgets/${budgetId}`),
};

export const settlementsApi = {
  list: (groupId) => api.get(`/groups/${groupId}/settlements`),
  create: (groupId, body) => api.post(`/groups/${groupId}/settlements`, body),
  update: (groupId, settlementId, body) =>
    api.patch(`/groups/${groupId}/settlements/${settlementId}`, body),
};

export const dashboardApi = {
  overview: () => api.get("/dashboard"),
};

export const attachmentsApi = {
  list: (targetType, targetId) => api.get(`/attachments/${targetType}/${targetId}`),
  upload: (targetType, targetId, formData, onUploadProgress) =>
    api.upload(`/attachments/${targetType}/${targetId}`, formData, onUploadProgress),
  remove: (attachmentId) => api.delete(`/attachments/${attachmentId}`),
};

export const notificationsApi = {
  list: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/mark-all-read"),
};
