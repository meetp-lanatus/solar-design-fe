import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  refreshTokenExpiry,
} from '../consts/cookieConst';
import { clearAllCookies, getCookie, setCookie } from './cookie.utils';

const backEndURL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

if (!backEndURL) {
  throw new Error(
    'Backend URL is not defined. Please set NEXT_PUBLIC_BACKEND_URL in your environment variables.'
  );
}

const axiosInstance = axios.create({
  baseURL: backEndURL,
  timeout: 30000,
});

let isRefreshing = false;
let refreshQueue = [];

const handleRefreshTokenCase = async () => {
  const refreshToken = getCookie(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    clearAllCookies();
    window.location.href = `${window.location.origin}/auth/signin`;
    return;
  }

  try {
    isRefreshing = true;

    const res = await axios.post(`${backEndURL}/auth/refresh`, {
      refreshToken,
    });

    const newAccessToken = res?.data?.accessToken;
    const newRefreshToken = res?.data?.refreshToken;
    const user = getCookie(USER_KEY);
    const userData = user ? JSON.parse(user) : {};

    if (newAccessToken) {
      const expiresInDays = res.data.expiresIn / (24 * 60 * 60);
      const refreshTokenExpiryDays = refreshTokenExpiry / (24 * 60 * 60);

      setCookie(ACCESS_TOKEN_KEY, newAccessToken, { expires: expiresInDays });
      setCookie(REFRESH_TOKEN_KEY, newRefreshToken, {
        expires: refreshTokenExpiryDays,
      });
      setCookie(
        USER_KEY,
        JSON.stringify({ ...userData, accessToken: newAccessToken }),
        { expires: refreshTokenExpiryDays }
      );
    }

    isRefreshing = false;

    refreshQueue.forEach((resolve) => resolve());
    refreshQueue = [];
  } catch (err) {
    isRefreshing = false;
    refreshQueue = [];
    clearAllCookies();
    window.location.href = `${window.location.origin}/auth/signin`;
  }
};

// Request interceptor: Add tokens to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = getCookie(ACCESS_TOKEN_KEY);
    const user = getCookie(USER_KEY);
    const userData = user ? JSON.parse(user) : {};
    let tenantId = userData?.tenantId || 1;

    if (
      !token &&
      window.location.pathname !== '/auth/signin' &&
      !isRefreshing
    ) {
      await handleRefreshTokenCase();
      token = getCookie(ACCESS_TOKEN_KEY);
      tenantId = JSON.parse(getCookie(USER_KEY) ?? '{}')?.tenantId ?? 1;
    }

    if (!token && isRefreshing) {
      await new Promise((resolve) => {
        refreshQueue.push(resolve);
      });
      token = getCookie(ACCESS_TOKEN_KEY);
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
      config.headers['x-tenant-id'] = tenantId;
    }
    return config;
  },
  async (error) => {
    console.error('Request error:', error);
    return await Promise.reject(error);
  }
);

// Add a response interceptor for centralized response handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // Return the response data
  },
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = getCookie(REFRESH_TOKEN_KEY);
      if (refreshToken && !isRefreshing) {
        try {
          await handleRefreshTokenCase();
          const newToken = getCookie(ACCESS_TOKEN_KEY);
          if (newToken) {
            error.config.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosInstance(error.config);
          }
        } catch (refreshError) {
          clearAllCookies();
          window.location.href = `${window.location.origin}/auth/signin`;
          return Promise.reject(refreshError);
        }
      } else {
        clearAllCookies();
        window.location.href = `${window.location.origin}/auth/signin`;
      }
    }

    const errorMessage = error.response?.data?.message || error.message;
    toast.error(errorMessage);
    return await Promise.reject(error);
  }
);

export { axiosInstance };
