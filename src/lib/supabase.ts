import { createClient } from '@supabase/supabase-js';

// Esta es la clave PUBLICA (anon) de Supabase: esta pensada para vivir
// en el codigo del frontend. El acceso real a los datos esta protegido
// por las politicas RLS de la base (solo usuarios logueados pueden
// leer/escribir), no por mantener esta clave en secreto.
const SUPABASE_URL = 'https://zimbmlxmjrsfcnqpjsqc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbWJtbHhtanJzZmNucXBqc3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMzM0MzgsImV4cCI6MjA5NjgwOTQzOH0.qMnPoiqTPICrXYGal8k8elvFSq-l9dLbcmAKZK3NIQc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
