import { axiosInstance } from '../../utils/axiosInstance';

export async function postLogin(body) {
  const res = await axiosInstance.post('/auth/login', body);
  return res;
}

export async function postRefreshToken(refreshToken) {
  const res = await axiosInstance.post('/auth/refresh', { refreshToken });
  return res;
}

export async function postForgotPassword(body) {
  const res = await axiosInstance.post('/auth/forgot-password', body);
  return res;
}

export async function postChangePassword(body) {
  const res = await axiosInstance.post('/auth/change-password', body);
  return res;
}

export async function postResetPassword(body) {
  const res = await axiosInstance.post('/auth/reset-password', body);
  return res;
}

export async function getMe() {
  const res = await axiosInstance.get('/auth/me');
  return res;
}

