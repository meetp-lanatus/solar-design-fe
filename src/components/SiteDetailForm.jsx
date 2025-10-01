import { Business, Home, LocationOn } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';

const staticCustomerData = {
  name: 'Meet Patel',
  email: 'meet.p@lanatusystems.com',
  phone: '+91 9874563210',
  company: 'Nes Solar Private LTD.',
};

export const SiteDetailForm = ({ formData, onFormChange, selectedAddress }) => {
  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    console.log('Submitting form data:', formData);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 5 }, maxWidth: 1300, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Site Details
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Section - Form */}
        <Grid item size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={1}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12 }}>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={formData.siteType || ''}
                    onChange={(e) =>
                      handleInputChange('siteType', e.target.value)
                    }
                    row
                    sx={{ gap: 2 }}
                  >
                    <FormControlLabel
                      value="residential"
                      control={<Radio />}
                      label={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Home color="primary" />
                          <Typography>Residential</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="commercial"
                      control={<Radio />}
                      label={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Business color="primary" />
                          <Typography>Commercial</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={formData.siteName || ''}
                  onChange={(e) =>
                    handleInputChange('siteName', e.target.value)
                  }
                  placeholder="e.g., Johnson Residence"
                  size="large"
                />
              </Grid>

              <Grid item size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={formData.customer || ''}
                  onChange={(e) =>
                    handleInputChange('customer', e.target.value)
                  }
                  placeholder="e.g., Sarah Johnson"
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status || ''}
                    onChange={(e) =>
                      handleInputChange('status', e.target.value)
                    }
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Installation Date"
                  type="date"
                  value={formData.installationDate || ''}
                  onChange={(e) =>
                    handleInputChange('installationDate', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Estimated Peak Power"
                  type="number"
                  value={formData.estimatedPeakPowerValue || ''}
                  onChange={(e) =>
                    handleInputChange('estimatedPeakPowerValue', e.target.value)
                  }
                  placeholder="e.g., 5.5"
                  inputProps={{ step: '0.1' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <FormControl variant="standard" sx={{ minWidth: 80 }}>
                          <Select
                            value={formData.estimatedPeakPowerUnit || 'kWp'}
                            onChange={(e) =>
                              handleInputChange(
                                'estimatedPeakPowerUnit',
                                e.target.value
                              )
                            }
                            sx={{
                              '& .MuiSelect-select': {
                                padding: '8px 12px',
                                fontSize: '0.875rem',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                                {
                                  border: 'none',
                                },
                            }}
                          >
                            <MenuItem value="Wp">Wp</MenuItem>
                            <MenuItem value="kWp">kWp</MenuItem>
                            <MenuItem value="MWp">MWp</MenuItem>
                          </Select>
                        </FormControl>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or comments..."
                />
              </Grid>

              <Grid item size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                    sx={{
                      textTransform: 'none',
                      px: 4,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Save Details
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Section - Info Card */}
        <Grid item size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={1}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              height: 'fit-content',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {/* Address */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Selected Address
              </Typography>
              <Box
                sx={{
                  p: 2.5,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                  backgroundColor: 'grey.50',
                }}
              >
                {selectedAddress ? (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <LocationOn color="primary" fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedAddress.formatted_address}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Lat {selectedAddress.lat?.toFixed(5)}, Lon{' '}
                      {selectedAddress.lng?.toFixed(5)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No address selected
                  </Typography>
                )}
              </Box>
            </Box>

            {/* <Divider /> */}

            {/* Customer Info */}
            {/* <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 40, height: 40 }}>
                  <Person fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Customer Info
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={1.5}>
                {[
                  { label: 'Name', value: staticCustomerData.name },
                  { label: 'Email', value: staticCustomerData.email },
                  { label: 'Phone', value: staticCustomerData.phone },
                  { label: 'Company', value: staticCustomerData.company },
                ].map((field, i) => (
                  <Grid item xs={12} key={i}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {field.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {field.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box> */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
