import { Navigation as NavigationIcon } from '@mui/icons-material';
import { Box, Button, TextField, Typography } from '@mui/material';

export const LatLngInput = ({ latInput, lngInput, onLatChange, onLngChange, onSubmit }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
        Enter latitude and longitude
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <TextField
          value={latInput}
          onChange={onLatChange}
          type='number'
          inputProps={{ step: '0.0001' }}
          placeholder='Latitude'
          size='small'
        />
        <TextField
          value={lngInput}
          onChange={onLngChange}
          type='number'
          inputProps={{ step: '0.0001' }}
          placeholder='Longitude'
          size='small'
        />
      </Box>
      <Button
        variant='contained'
        color='secondary'
        onClick={onSubmit}
        fullWidth
        startIcon={<NavigationIcon />}
      >
        Fly To
      </Button>
    </Box>
  );
};
