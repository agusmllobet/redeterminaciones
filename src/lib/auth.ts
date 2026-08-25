import { supabase } from './supabase';

// Supabase Auth necesita un email y una contraseña de al menos 6
// caracteres. Para mantener la experiencia simple (usuario + PIN de 4
// digitos) mapeamos internamente a un email ficticio y completamos la
// contraseña con un sufijo fijo. La seguridad real no depende de este
// sufijo (es publico, esta en el codigo) sino de que ademas haga falta
// el PIN correcto de la persona.
const SUFIJO = 'redetAUSA';

function emailDe(usuario: string) {
  return `${usuario.trim().toLowerCase()}@redet.internal`;
}

export async function login(usuario: string, pin: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailDe(usuario),
    password: `${pin}-${SUFIJO}`,
  });
  if (error) throw error;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function usuarioActual(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user.email;
  if (!email) return null;
  return email.split('@')[0];
}
