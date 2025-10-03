import { Box } from '@mui/material';
import { useState } from 'react';
import { StepContent } from './StepContent';
import { StepperHeader } from './StepperHeader';

const steps = ['Address', 'Site Info'];
export const Site = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    siteName: '',
    siteType: '',
    customer: '',
    status: '',
    installationDate: '',
    estimatedPeakPowerValue: '',
    estimatedPeakPowerUnit: 'kWp',
    notes: '',
  });

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else if (activeStep === steps.length - 1) {
      console.log('Complete Data:', {
        address: selectedAddress,
        siteDetails: formData,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const canProceedToStep1 = selectedAddress !== null;
  const canProceedToStep2 = formData.siteName && formData.siteType && formData.customer;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <StepperHeader
        steps={steps}
        activeStep={activeStep}
        canProceedToStep1={canProceedToStep1}
        canProceedToStep2={canProceedToStep2}
        onNext={handleNext}
        onBack={handleBack}
      />

      <StepContent
        activeStep={activeStep}
        selectedAddress={selectedAddress}
        formData={formData}
        onAddressSelect={handleAddressSelect}
        onFormChange={handleFormChange}
        onNext={handleNext}
        onBack={handleBack}
        canProceedToStep2={canProceedToStep2}
      />
    </Box>
  );
};
