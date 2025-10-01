import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

import { setCookie } from '../../../utils/cookie.utils';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  refreshTokenExpiry,
} from '../../../consts/cookieConst';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const AuthCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const expiresIn = urlParams.get('expiresIn');
        const refreshToken = urlParams.get('refreshToken');

        if (!token || !expiresIn || !refreshToken) {
          throw new Error('Missing required authentication parameters');
        }

        const expiresInSeconds = parseInt(expiresIn);
        if (isNaN(expiresInSeconds)) {
          throw new Error('Invalid expiration time');
        }

        setCookie(ACCESS_TOKEN_KEY, token, {
          expires: expiresInSeconds / (24 * 60 * 60),
        });
        setCookie(REFRESH_TOKEN_KEY, refreshToken, {
          expires: refreshTokenExpiry / (24 * 60 * 60),
        });

        const userData = {
          id: 'google-user',
          email: 'user@gmail.com',
          name: 'Google User 123',
          accessToken: token,
          refreshToken: refreshToken,
        };

        setCookie(USER_KEY, JSON.stringify(userData), {
          expires: refreshTokenExpiry / (24 * 60 * 60),
        });

        toast.success('Successfully signed in with Google!');

        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (err) {
        console.error('Auth callback processing error:', err);
        const errorMsg = err.message || 'Authentication failed';
        setError(errorMsg);
        toast.error(errorMsg);

        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate]);

  if (isProcessing) {
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
              Processing Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we complete your sign-in...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
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
          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ p: 3 }}>
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{ mb: 2, textAlign: 'left' }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Authentication Failed
                </Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
              <Button
                onClick={() => navigate('/auth/signin')}
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  background:
                    'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
                  },
                }}
              >
                Return to Sign In
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return null;
};

export default AuthCallback;
