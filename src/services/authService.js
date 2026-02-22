import { loginApi, registerApi, logoutApi, getMeApi } from "../api/authApi";
import { setTokens, clearTokens, getAccessToken } from "./tokenService";

const decodeJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
};

export const login = async (credentials) => {
  const { data } = await loginApi(credentials);
  console.log("Login response data:", data);

  const accessToken = data.accessToken || data.token || data.user?.token;
  const refreshToken = data.refreshToken || data.user?.refreshToken;
  const user = data.user || data.data?.user;

  if (!accessToken) throw new Error("No access token in response");
  setTokens(accessToken, refreshToken);

  const jwtClaims = decodeJwt(accessToken);
  console.log("JWT claims:", jwtClaims);
  return normalizeUser(user, jwtClaims);
};

export const register = async (userData) => {
  const { data } = await registerApi(userData);
  const accessToken = data.accessToken || data.token || data.user?.token;
  const refreshToken = data.refreshToken || data.user?.refreshToken;
  const user = data.user || data.data?.user;

  if (!accessToken) throw new Error("No access token in response");
  setTokens(accessToken, refreshToken);

  const jwtClaims = decodeJwt(accessToken);
  return normalizeUser(user, jwtClaims);
};

export const logout = async () => {
  try {
    await logoutApi();
  } catch {
    // ignore
  }
  clearTokens();
};

export const getMe = async () => {
  const { data } = await getMeApi();
  console.log("getMe raw response:", data);

  const user = data.user || data.data?.user || data;

  // ✅ Always decode current stored token to get tenantId as fallback
  const storedToken = getAccessToken();
  const jwtClaims = storedToken ? decodeJwt(storedToken) : {};
  console.log("getMe jwtClaims:", jwtClaims);

  return normalizeUser(user, jwtClaims);
};

const normalizeUser = (user, jwtClaims = {}) => {
  if (!user) return null;
  return {
    id: user.id || user._id || user.userId || jwtClaims.sub,
    name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    email: user.email,
    role: user.role || jwtClaims.role,
    // ✅ jwtClaims.tenantId used as fallback — always populated from JWT
    tenantId:
      user.tenantId || user.tenant_id || user.tenant || jwtClaims.tenantId,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
  };
};
