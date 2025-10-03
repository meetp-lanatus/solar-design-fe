import { Route, Routes } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Site } from './components/Site';
import { GoogleCallback } from './pages/auth/google-callback';
import { Signin } from './pages/auth/signin';
import { CustomersPage } from './pages/customers';

function App() {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <Site />
          </ProtectedRoute>
        }
      />
      <Route
        path='/auth/signin'
        element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        }
      />
      <Route
        path='/customers'
        element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        }
      />

      <Route path='/auth/api/callback/google' element={<GoogleCallback />} />
    </Routes>
  );
}

export default App;
