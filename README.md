# Redeterminaciones

App para gestionar redeterminaciones de precios (arranca con AUSA).
Sitio estatico (React + Vite) hosteado en GitHub Pages, datos en Supabase.

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy

Automático: cada push a `main` dispara el workflow de GitHub Actions
(`.github/workflows/deploy.yml`) que compila y publica en GitHub Pages.

## Usuarios

Login con Supabase Auth. Los 2 usuarios (`agus`, `facturacion`) ya están
creados en el proyecto de Supabase. Para agregar/cambiar contraseñas,
hacerlo desde el dashboard de Supabase → Authentication → Users.
