import { Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Sidebar from './components/Sidebar';
import SolarMap from './components/Solarmap';
import GoogleCallback from './pages/auth/google-callback';
import { Signin } from './pages/auth/signin';
import { Test } from './pages/test/page';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="h-screen w-screen flex overflow-hidden">
              <Sidebar />
              <div className="flex-1">
                <SolarMap />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth/signin"
        element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        }
      />
      <Route
        path="/test"
        element={
          <PublicRoute>
            <Test />
          </PublicRoute>
        }
      />
      <Route path="/auth/api/callback/google" element={<GoogleCallback />} />
    </Routes>
  );
}

export default App;
