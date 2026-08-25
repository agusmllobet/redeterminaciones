import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { usuarioActual } from '../lib/auth';

type AuthState = {
  usuario: string | null;
  cargando: boolean;
};

const AuthContext = createContext<AuthState>({ usuario: null, cargando: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    usuarioActual().then((u) => {
      setUsuario(u);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user.email ? session.user.email.split('@')[0] : null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
