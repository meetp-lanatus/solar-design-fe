import { Bolt as BoltIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import GoogleIcon from '../assets/icons/google-icon-logo.svg';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const { signIn, signInWithGoogle, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await signIn(data.email, data.password);
      if (result.status) {
        window.location.href = '/';
      } else {
        toast.error('Sign in failed: ' + result.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Sign in failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Google sign in failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        px: { xs: 2, sm: 3, lg: 4 },
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: 3,
            border: 1,
            borderColor: 'grey.200',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  mx: 'auto',
                  width: 48,
                  height: 48,
                  background:
                    'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <BoltIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}
              >
                Solar Designer
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Design your perfect solar solution
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}
              >
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account to continue
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ mb: 3 }}
            >
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  id="email"
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  placeholder="Enter your email"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'grey.50',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  id="password"
                  type="password"
                  label="Password"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  placeholder="Enter your password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'grey.50',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.dark',
                    },
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  background:
                    'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress
                      size={20}
                      sx={{ color: 'white', mr: 1 }}
                    />
                    Signing in...
                  </Box>
                ) : (
                  'Sign in'
                )}
              </Button>
            </Box>

            <Box sx={{ position: 'relative', my: 3 }}>
              <Divider />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'white',
                  px: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Or continue with
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              fullWidth
              variant="outlined"
              sx={{
                py: 1.5,
                borderColor: 'grey.300',
                color: 'text.primary',
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: 'grey.50',
                  borderColor: 'grey.400',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              <Box
                component="img"
                src={GoogleIcon}
                alt="Google Logo"
                sx={{ width: 20, height: 20, mr: 1.5 }}
              />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SignIn;
