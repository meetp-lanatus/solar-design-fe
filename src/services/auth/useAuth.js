import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getAuthUser, isAuthenticated } from '../../utils/auth.utils';
import { clearAuthCookies, setAuthCookies } from '../../utils/cookie.utils';
import { postChangePassword, postForgotPassword, postLogin, postRefreshToken, postResetPassword } from './auth.api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const result = await postLogin(data);

      if (!result) {
        throw new Error('Invalid response structure');
      }

      const { accessToken, refreshToken, expiresIn } = result;

      const userData = {
        id: result.data.id || result.user?.id || 'user',
        email: result.data.email || result.user?.email || data.email,
        name: result.data.name || result.user?.name || data.email,
      };

      setAuthCookies(accessToken, refreshToken, expiresIn, userData);

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
        expiresIn,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast.success('Successfully signed in!');
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
      const userData = {
        id: 'google-user',
        email: 'user@gmail.com',
        name: 'Google User',
      };

      setAuthCookies(token, refreshToken, expiresIn, userData);

      return {
        success: true,
        user: userData,
        accessToken: token,
        refreshToken: refreshToken,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast.success('Successfully signed in with Google!');
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

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refreshToken) => {
      const result = await postRefreshToken(refreshToken);

      if (!result.data) {
        throw new Error('Invalid refresh token response');
      }

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = result.data;
      const userData = getAuthUser() || {};

      setAuthCookies(accessToken, newRefreshToken, expiresIn, userData);

      return {
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    },
    onError: (error) => {
      console.error('Refresh token error:', error);
      clearAuthCookies();
      queryClient.clear();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      clearAuthCookies();
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
