import Cookies from 'js-cookie';

export const getCookie = (name) => {
  return Cookies.get(name);
};

export const setCookie = (name, value, options = {}) => {
  const defaultOptions = {
    expires: 7, // 7 days
    secure: import.meta.env.PROD, // Only secure in production
    sameSite: 'strict',
    path: '/',
    httpOnly: false, // js-cookie doesn't support httpOnly, but we set secure
  };

  return Cookies.set(name, value, { ...defaultOptions, ...options });
};

export const clearCookie = (name, options = {}) => {
  return Cookies.remove(name, { path: '/', ...options });
};

export const clearAllCookies = () => {
  const cookies = Cookies.get();
  Object.keys(cookies).forEach((cookieName) => {
    Cookies.remove(cookieName, { path: '/' });
  });
};

export const setAuthCookies = (accessToken, refreshToken, expiresIn, userData) => {
  const expiresInDays = expiresIn / (24 * 60 * 60);
  const refreshTokenExpiryDays = 365; // 1 year for refresh token

  setCookie('access-token', accessToken, { expires: expiresInDays });
  setCookie('refresh-token', refreshToken, { expires: refreshTokenExpiryDays });
  setCookie('user', JSON.stringify(userData), { expires: refreshTokenExpiryDays });
};

export const clearAuthCookies = () => {
  clearCookie('access-token');
  clearCookie('refresh-token');
  clearCookie('user');
};
