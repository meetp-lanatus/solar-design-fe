import { getCookie } from './cookie.utils';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../constants';

export const extractGoogleCallbackParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const expiresIn = urlParams.get('expiresIn');
  const refreshToken = urlParams.get('refreshToken');

  return {
    token,
    expiresIn: expiresIn ? parseInt(expiresIn) : null,
    refreshToken,
    hasValidParams: !!(token && expiresIn && refreshToken),
  };
};

export const clearUrlParams = () => {
  const url = new URL(window.location);
  url.searchParams.delete('token');
  url.searchParams.delete('expiresIn');
  url.searchParams.delete('refreshToken');
  window.history.replaceState({}, document.title, url.pathname);
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return true;
  }
};

export const isAuthenticated = () => {
  const accessToken = getCookie(ACCESS_TOKEN_KEY);
  const refreshToken = getCookie(REFRESH_TOKEN_KEY);
  const user = getCookie(USER_KEY);

  if (!accessToken || !refreshToken || !user) {
    return false;
  }

  if (isTokenExpired(accessToken)) {
    return !!refreshToken;
  }

  return true;
};

export const getAuthUser = () => {
  const user = getCookie(USER_KEY);
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};
