import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import AusaPage from './pages/AusaPage';

export default function App() {
  return (
    <BrowserRouter basename="/redeterminaciones">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/ausa"
            element={
              <RequireAuth>
                <AusaPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/ausa" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
