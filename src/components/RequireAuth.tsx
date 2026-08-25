import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-400">Cargando…</p>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
