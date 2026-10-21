// App api helper file for React Native app, using axios for API calls and expo-secure-store for token management. It includes request and response interceptors to handle authentication tokens and automatic token refreshing on 401 errors.
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE =
    "https://www.api.bharatscrapfacilities.com";

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* ========================
   Token Helpers
======================== */
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const saveTokens = async (accessToken, refreshToken) => {
    // console.log("saveTokens", accessToken, refreshToken);
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = async () => {
    // console.log("getAccessToken");
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
    // console.log("getRefreshToken");
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const clearTokens = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const isLoggedIn = async () => {
    const accessToken = await getAccessToken();
    return !!accessToken;   // true if token exists
};

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(async (config) => {
    const accessToken = await getAccessToken();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh-token')
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = await getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token found');
                }

                // Refresh token call (using plain axios to avoid infinite loop)
                const res = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
                    refreshToken,
                });

                const newAccessToken = res.data.accessToken;
                const newRefreshToken = res.data.refreshToken || refreshToken;

                await saveTokens(newAccessToken, newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest); // retry original request
            } catch (refreshError) {
                console.log("Token refresh failed:", refreshError);
                await clearTokens();

                // Yahan logout logic daal sakte ho (navigation to login screen)
                // navigation.navigate('Login');   // ya global event use karo

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;