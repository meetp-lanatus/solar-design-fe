import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { SiteDetailForm } from './SiteDetailForm';
import { SolarMap } from './Solarmap';

export const StepContent = ({
  activeStep,
  selectedAddress,
  formData,
  onAddressSelect,
  onFormChange,
  onNext,
  onBack,
  canProceedToStep2,
}) => {
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <Sidebar onAddressSelect={onAddressSelect} selectedAddress={selectedAddress} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <SolarMap selectedAddress={selectedAddress} />
              </Box>
            </Box>
          </Box>
        );
      case 1:
        return (
          <SiteDetailForm
            formData={formData}
            onFormChange={onFormChange}
            selectedAddress={selectedAddress}
            onNext={onNext}
            onBack={onBack}
            canProceed={canProceedToStep2}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {activeStep === 1 ? (
        <Box sx={{ flex: 1, overflow: 'auto' }}>{renderStepContent()}</Box>
      ) : (
        <Box sx={{ flex: 1, overflow: 'hidden' }}>{renderStepContent()}</Box>
      )}
    </Box>
  );
};
