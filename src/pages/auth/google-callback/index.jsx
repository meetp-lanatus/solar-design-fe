import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { extractGoogleCallbackParams, clearUrlParams } from '../../../utils/auth.utils';

const GoogleCallback = () => {
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Processing Google Authentication
          </h2>
          <p className="text-slate-600">Please wait while we complete your sign-in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-red-800 font-semibold">Authentication Failed</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
          <button
            onClick={() => (window.location.href = '/auth/signin')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
