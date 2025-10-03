import axios from 'axios';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../constants';
import { getAuthUser } from './auth.utils';
import { clearAuthCookies, getCookie, setAuthCookies } from './cookie.utils';

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
    clearAuthCookies();
    window.location.href = `${window.location.origin}/auth/signin`;
    return;
  }

  try {
    isRefreshing = true;

    const res = await axios.post(`${backEndURL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = res.data.data;
    const userData = getAuthUser() || {};

    if (accessToken) {
      setAuthCookies(accessToken, newRefreshToken, expiresIn, userData);
    }

    isRefreshing = false;

    refreshQueue.forEach((resolve) => resolve());
    refreshQueue = [];
  } catch (err) {
    isRefreshing = false;
    refreshQueue = [];
    clearAuthCookies();
    window.location.href = `${window.location.origin}/auth/signin`;
  }
};

// Request interceptor: Add tokens to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = getCookie(ACCESS_TOKEN_KEY);
    let tenantId = 1;

    if (!token && window.location.pathname !== '/auth/signin' && !isRefreshing) {
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
          clearAuthCookies();
          window.location.href = `${window.location.origin}/auth/signin`;
          return Promise.reject(refreshError);
        }
      } else {
        clearAuthCookies();
        window.location.href = `${window.location.origin}/auth/signin`;
      }
    }

    const errorMessage = error.response?.data?.message || error.message;
    toast.error(errorMessage);
    return await Promise.reject(error);
  }
);

export { axiosInstance };
