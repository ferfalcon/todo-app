import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './routes/LoginPage';
import { SignupPage } from './routes/SignupPage';
import { TodoPage } from './routes/TodoPage';

function App() {
  return (
    <Routes>
      {/* Auth routes: /login, /signup */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Main app route: /app (todo list) */}
      <Route element={<MainLayout />}>
        <Route path="/app" element={<TodoPage />} />
      </Route>

      {/* Fallback: anything else → /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
