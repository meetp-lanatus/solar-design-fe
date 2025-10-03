import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

export const CustomerModal = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  title = 'Add Customer',
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roleName: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        roleName: initialData.roleName.replaceAll(' ', '-') || '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        roleName: '',
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 600 }}>{title}</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='firstName'
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='First Name'
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='lastName'
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Last Name'
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Email is invalid',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Email'
                      type='email'
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      placeholder='ex: name@gmail.com'
                      required
                      disabled={!!initialData}
                    />
                  )}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='roleName'
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.roleName}>
                      <InputLabel>Role</InputLabel>
                      <Select {...field} label='Role'>
                        <MenuItem value='customer'>Customer</MenuItem>
                        <MenuItem value='admin'>Admin</MenuItem>
                        <MenuItem value='super-admin'>Super Admin</MenuItem>
                      </Select>
                      {errors.roleName && (
                        <Box
                          sx={{
                            color: 'error.main',
                            fontSize: '0.75rem',
                            mt: 0.5,
                          }}
                        >
                          {errors.roleName.message}
                        </Box>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={handleClose} variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} variant='contained' color='primary'>
          {initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
