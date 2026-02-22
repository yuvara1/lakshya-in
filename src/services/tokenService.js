import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "lakshya_access_token";
const REFRESH_TOKEN_KEY = "lakshya_refresh_token";

const COOKIE_OPTIONS = {
  expires: 7, // 1 week
  secure: import.meta.env.PROD, // HTTPS only in production
  sameSite: "Strict",
  path: "/", // ✅ Use root path so cookies are accessible on all routes
};

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY) || null;

export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY) || null;

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, COOKIE_OPTIONS);
  }
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, COOKIE_OPTIONS);
  }
};

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
};
