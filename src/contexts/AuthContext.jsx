import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN_KEY, USER_KEY } from '../constants';
import { useGoogleCallback, useLogin, useLogout } from '../services/auth/useAuth';
import { getAuthUser, isAuthenticated } from '../utils/auth.utils';
import { clearAuthCookies, getCookie } from '../utils/cookie.utils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      if (!isAuthenticated()) {
        throw new Error('Not authenticated');
      }
      return getAuthUser();
    },
    enabled: isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useLogin();
  const googleCallbackMutation = useGoogleCallback();
  const logoutMutation = useLogout();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        if (!authenticated) {
          if (getCookie(USER_KEY) || getCookie(ACCESS_TOKEN_KEY)) {
            clearAuthCookies();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthCookies();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (userError && isInitialized) {
      clearAuthCookies();
    }
  }, [userError, isInitialized]);

  const signIn = async (email, password) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'Sign in failed' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUri = import.meta.env.VITE_PUBLIC_BACKEND_URL + `/auth/google/login`;

      if (!redirectUri) {
        console.error('Google OAuth redirect URI not set.');
        return { success: false, error: 'OAuth configuration error' };
      }

      window.location.replace(redirectUri);
      return { success: true };
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Google sign in failed: ' + (error.message || 'Unknown error'));
      return {
        success: false,
        error: error.message || 'Google sign in failed',
      };
    }
  };

  const handleGoogleCallback = async (token, expiresIn, refreshToken) => {
    try {
      const result = await googleCallbackMutation.mutateAsync({
        token,
        expiresIn,
        refreshToken,
      });
      return result;
    } catch (error) {
      console.error('Google callback error:', error);
      return {
        success: false,
        error: error.message || 'Google authentication failed',
      };
    }
  };

  const signOut = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isLoading =
    isUserLoading ||
    loginMutation.isPending ||
    googleCallbackMutation.isPending ||
    logoutMutation.isPending;

  const value = {
    user,
    isLoading,
    signIn,
    signInWithGoogle,
    handleGoogleCallback,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
