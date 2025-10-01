import Cookies from 'js-cookie';

export const getCookie = (name) => {
  return Cookies.get(name);
};

export const setCookie = (name, value, options = {}) => {
  const defaultOptions = {
    expires: 7, // 7 days
    secure: true,
    sameSite: 'strict',
    path: '/',
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
