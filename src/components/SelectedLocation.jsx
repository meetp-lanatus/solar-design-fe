import { Box, Button, Paper, Typography } from '@mui/material';

export default function SelectedLocation({
    selectedResult,
    selectedAddress,
    latInput,
    lngInput,
    onClear
}) {
    if (!selectedResult) return null;

    return (
        <Paper
            elevation={1}
            sx={{
                p: 2,
                backgroundColor: '#f0f9ff',
                border: 1,
                borderColor: '#0ea5e9',
                borderRadius: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0c4a6e' }}>
                    Selected Location
                </Typography>
                <Button
                    size="small"
                    onClick={onClear}
                    sx={{
                        minWidth: 'auto',
                        p: 0.5,
                        color: '#0369a1',
                        '&:hover': { backgroundColor: '#e0f2fe' },
                    }}
                >
                    Clear
                </Button>
            </Box>

            <Box sx={{ mb: 1.5 }}>
                <Typography
                    variant="body2"
                    sx={{ color: '#0c4a6e', lineHeight: 1.4, fontWeight: 500 }}
                >
                    {selectedResult.formatted_address}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    alignItems: 'flex-start',
                    p: 1.5,
                    backgroundColor: '#ffffff',
                    borderRadius: 1,
                    border: 1,
                    borderColor: '#e0f2fe',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600 }}>
                        Latitude
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0c4a6e', fontWeight: 500 }}>
                        {selectedAddress?.lat?.toFixed(6) || latInput}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600 }}>
                        Longitude
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0c4a6e', fontWeight: 500 }}>
                        {selectedAddress?.lng?.toFixed(6) || lngInput}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}
