import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { isAuthenticated } from '../utils/auth.utils';

export const PublicRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        setIsAuth(authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

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

  if (isAuth) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};
