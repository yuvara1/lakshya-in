import axiosInstance from "./axiosInstance";

export const loginApi = (credentials) =>
  axiosInstance.post("api/auth/login", credentials);

export const registerApi = (userData) =>
  axiosInstance.post("/api/auth/register", userData);

export const logoutApi = () => axiosInstance.post("/api/auth/logout");

export const refreshTokenApi = (refreshToken) =>
  axiosInstance.post("/api/auth/refresh", { refreshToken });

export const getMeApi = () => axiosInstance.get("/api/auth/me");

// Tenant CRUD (Super Admin)
export const getAllTenantsApi = () => axiosInstance.get("/api/tenants");

export const getTenantByIdApi = (tenantId) =>
  axiosInstance.get(`/api/tenants/${tenantId}`);

export const deleteTenantApi = (tenantId) =>
  axiosInstance.delete(`/api/tenants/${tenantId}`);

// Tenant Users (Admin)
export const getTenantUsersApi = (tenantId) =>
  axiosInstance.get(`/api/tenants/${tenantId}/admin/users`);

export const createTenantUserApi = (tenantId, data) => {
  console.log("createTenantUserApi called with tenantId:", tenantId); // ✅ debug
  return axiosInstance.post(`/api/tenants/${tenantId}/admin/users`, data);
};

export const updateTenantUserApi = (tenantId, userId, data) =>
  axiosInstance.put(`/api/tenants/${tenantId}/admin/users/${userId}`, data);

export const deleteTenantUserApi = (tenantId, userId) =>
  axiosInstance.delete(`/api/tenants/${tenantId}/admin/users/${userId}`);
