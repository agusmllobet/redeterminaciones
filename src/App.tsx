import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import ClientesPage from './pages/ClientesPage';
import AusaPage from './pages/AusaPage';

export default function App() {
  return (
    <BrowserRouter basename="/redeterminaciones">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/clientes"
            element={
              <RequireAuth>
                <ClientesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/ausa"
            element={
              <RequireAuth>
                <AusaPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/clientes" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
