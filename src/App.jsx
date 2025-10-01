import { Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { Site } from './components/Site';
import { Signin } from './pages/auth/signin';
import GoogleCallback from './pages/auth/google-callback';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Site />
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

      <Route path="/auth/api/callback/google" element={<GoogleCallback />} />
    </Routes>
  );
}

export default App;
