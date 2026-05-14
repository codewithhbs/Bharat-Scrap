// admin src/utils/api.js
import axios from "axios";
import { toast } from "react-toastify";
// import toast from "react-hot-toast";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.13:4023";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ========================
   Token Helpers
======================== */
const ACCESS_TOKEN_KEY = "adpt_token";
const REFRESH_TOKEN_KEY = "adpt_refresh_token";

const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    /* =========================
       AUTO REFRESH TOKEN
    ========================= */
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const res = await axios.post(
          `${API_BASE}/auth/refresh-token`,
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;
        const newRefreshToken =
          res.data.refreshToken || refreshToken;

        saveTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.warn("Session expired. Logging out...");
        clearTokens();

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    /* =========================
       ERROR HANDLING
    ========================= */
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong";

    if (status !== 401) {
      toast.error(message);
    }

    if (status === 403) {
      console.warn("Forbidden:", message);
    }

    if (status === 404) {
      console.warn("Not Found:", message);
    }

    if (status >= 500) {
      console.error("Server Error:", message);
    }

    if (!error.response) {
      console.error("Network Error. Check internet connection.");
      toast.error("Network error");
    }

    return Promise.reject({
      status,
      message,
      original: error,
    });
  }
);

export default api;