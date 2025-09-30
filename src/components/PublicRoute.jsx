import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { isAuthenticated } from '../utils/auth.utils';

const PublicRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        setIsAuth(authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading...</h2>
          <p className="text-slate-600">Please wait while we verify your authentication...</p>
        </div>
      </div>
    );
  }

  // if (isAuth) {
  //   const from = location.state?.from?.pathname || '/';
  //   return <Navigate to={from} replace />;
  // }

  return children;
};

export default PublicRoute;
