import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  postChangePassword,
  postForgotPassword,
  postLogin,
  postResetPassword,
} from '../services/auth/auth.api';
import { getAuthUser, isAuthenticated } from '../utils/auth.utils';
import { clearAllCookies } from '../utils/cookie.utils';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const result = await postLogin(data);
      const { setCookie } = await import('../utils/cookie.utils');
      const { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, refreshTokenExpiry } = await import(
        '../consts/cookieConst'
      );

      const expiresInDays = parseInt(result.expiresIn) / (24 * 60 * 60);
      const refreshTokenExpiryDays = refreshTokenExpiry / (24 * 60 * 60);

      setCookie(ACCESS_TOKEN_KEY, result.accessToken, { expires: expiresInDays });
      setCookie(REFRESH_TOKEN_KEY, result.refreshToken, {
        expires: refreshTokenExpiryDays,
      });

      const userData = {
        id: result.id || 'user',
        email: result.email || '',
        name: result.name || '',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };

      setCookie(USER_KEY, JSON.stringify(userData), {
        expires: refreshTokenExpiryDays,
      });

      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['auth', 'user'], data.user);
        toast.success('Successfully signed in!');
      } else {
        toast.error(data.error || 'Login failed');
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast.error('Login failed: ' + (error.message || 'Unknown error'));
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: postForgotPassword,
    onSuccess: (data) => {
      toast.success('Password reset email sent!');
    },
    onError: (error) => {
      console.error('Forgot password error:', error);
      toast.error('Failed to send reset email: ' + (error.message || 'Unknown error'));
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: postChangePassword,
    onSuccess: (data) => {
      toast.success('Password changed successfully!');
    },
    onError: (error) => {
      console.error('Change password error:', error);
      toast.error('Failed to change password: ' + (error.message || 'Unknown error'));
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: postResetPassword,
    onSuccess: (data) => {
      toast.success('Password reset successfully!');
    },
    onError: (error) => {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password: ' + (error.message || 'Unknown error'));
    },
  });
};

export const useGoogleCallback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, expiresIn, refreshToken }) => {
      const { setCookie } = await import('../utils/cookie.utils');
      const { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, refreshTokenExpiry } = await import(
        '../consts/cookieConst'
      );

      const expiresInDays = parseInt(expiresIn) / (24 * 60 * 60);
      const refreshTokenExpiryDays = refreshTokenExpiry / (24 * 60 * 60);

      setCookie(ACCESS_TOKEN_KEY, token, { expires: expiresInDays });
      setCookie(REFRESH_TOKEN_KEY, refreshToken, {
        expires: refreshTokenExpiryDays,
      });

      const userData = {
        id: 'google-user',
        email: 'user@gmail.com',
        name: 'Google User',
        accessToken: token,
        refreshToken: refreshToken,
      };

      setCookie(USER_KEY, JSON.stringify(userData), {
        expires: refreshTokenExpiryDays,
      });

      return {
        success: true,
        user: userData,
        accessToken: token,
        refreshToken: refreshToken,
      };
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['auth', 'user'], data.user);
        toast.success('Successfully signed in with Google!');
      } else {
        toast.error(data.error || 'Google authentication failed');
      }
    },
    onError: (error) => {
      console.error('Google callback error:', error);
      toast.error('Google authentication failed: ' + (error.message || 'Unknown error'));
    },
  });
};

export const useAuthUser = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }
      return getAuthUser();
    },
    enabled: false,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      clearAllCookies();
      queryClient.clear();
    },
    onSuccess: () => {
      toast.success('Successfully signed out');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      toast.error('Logout failed: ' + (error.message || 'Unknown error'));
    },
  });
};
