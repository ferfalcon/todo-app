import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './routes/LoginPage';
import { SignupPage } from './routes/SignupPage';
import { TodoPage } from './routes/TodoPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { RedirectIfAuthenticated } from './components/auth/RedirectIfAuthenticated';

function App() {
  return (
    <Routes>
      {/* Auth routes: /login, /signup */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated>
              <SignupPage />
            </RedirectIfAuthenticated>
          }
        />
      </Route>

      {/* Protected app routes */}
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/app" element={<TodoPage />} />
      </Route>

      {/* Fallback: anything else → /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
