import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { getAuthUser, isAuthenticated } from '../utils/auth.utils';
import { Box, CircularProgress, Container, Typography } from '@mui/material';

export const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        const userData = getAuthUser();

        if (authenticated && userData) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50',
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              size={48}
              sx={{
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
            >
              Loading...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your authentication...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!isAuth) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return children;
};
