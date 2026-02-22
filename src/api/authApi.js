import axiosInstance from "./axiosInstance";

export const loginApi = (credentials) =>
  axiosInstance.post("/api/auth/login", credentials);

export const registerApi = (userData) =>
  axiosInstance.post("/api/auth/register-organization", userData);

export const logoutApi = () => axiosInstance.post("/api/auth/logout");

export const refreshTokenApi = (refreshToken) =>
  axiosInstance.post("/api/auth/refresh", { refreshToken });

export const getMeApi = () => axiosInstance.get("/api/auth/me");
