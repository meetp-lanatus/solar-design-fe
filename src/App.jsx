import { Route, Routes } from 'react-router';
import { BaseLayout } from './components/BaseLayout';
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
            <BaseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Site />} />
        <Route path='customers' element={<CustomersPage />} />
      </Route>

      <Route path='/auth'>
        <Route
          index
          path='signin'
          element={
            <PublicRoute>
              <Signin />
            </PublicRoute>
          }
        />

        <Route path='api/callback/google' element={<GoogleCallback />} />
      </Route>
    </Routes>
  );
}

export default App;
