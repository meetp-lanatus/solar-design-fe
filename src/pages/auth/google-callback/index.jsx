import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { extractGoogleCallbackParams, clearUrlParams } from '../../../utils/auth.utils';
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

export const GoogleCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        const { token, expiresIn, refreshToken, hasValidParams } = extractGoogleCallbackParams();

        if (!hasValidParams) {
          setError('Invalid callback parameters');
          setIsProcessing(false);
          return;
        }

        const result = await handleGoogleCallback(token, expiresIn, refreshToken);

        if (result.success) {
          clearUrlParams();
          toast.success('Successfully signed in with Google!');
          window.location.href = '/';
        } else {
          const errorMsg = result.error || 'Google authentication failed';
          setError(errorMsg);
          toast.error(errorMsg);
          clearUrlParams();
        }
      } catch (err) {
        console.error('Google callback processing error:', err);
        const errorMsg = 'Authentication failed';
        setError(errorMsg);
        toast.error(errorMsg);
        clearUrlParams();
      } finally {
        setIsProcessing(false);
      }
    };

    processGoogleCallback();
  }, [handleGoogleCallback]);

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
              Processing Google Authentication
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
              <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Authentication Failed
                </Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
              <Button
                onClick={() => (window.location.href = '/auth/signin')}
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
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
