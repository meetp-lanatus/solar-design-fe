import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Box, Button, Paper, Typography } from '@mui/material';

export const StepperHeader = ({
  steps,
  activeStep,
  canProceedToStep1,
  canProceedToStep2,
  onNext,
  onBack,
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 0,
        borderBottom: 1,
        borderColor: 'grey.200',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            Create Site
          </Typography>
        </Box>

        <Box
          component='nav'
          aria-label='Progress'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {steps.map((label, index) => {
              const isActive = index === activeStep;
              const isDone = index < activeStep;

              return (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 2,
                      ...(isDone
                        ? {
                            backgroundColor: 'secondary.main',
                            color: 'white',
                          }
                        : isActive
                          ? {
                              backgroundColor: 'primary.main',
                              color: 'white',
                            }
                          : {
                              backgroundColor: 'transparent',
                              borderColor: 'grey.300',
                              color: 'grey.600',
                            }),
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'primary.main' : isDone ? 'primary.dark' : 'text.secondary',
                      fontSize: '0.875rem',
                    }}
                  >
                    {label}
                  </Typography>
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        width: 40,
                        height: 2,
                        backgroundColor: isDone ? 'primary.main' : 'grey.300',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
          <Button
            variant='outlined'
            onClick={onBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBack />}
            size='small'
          >
            Back
          </Button>
          <Button
            variant='contained'
            onClick={onNext}
            disabled={
              (activeStep === 0 && !canProceedToStep1) || (activeStep === 1 && !canProceedToStep2)
            }
            endIcon={<ArrowForward />}
            size='small'
          >
            {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
