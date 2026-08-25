import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/auth';

type Cliente = {
  id: string;
  nombre: string;
  logo?: string;
  disponible: boolean;
  ruta?: string;
};

const CLIENTES: Cliente[] = [
  { id: 'ausa', nombre: 'AUSA', logo: 'logo-ausa.png', disponible: true, ruta: '/ausa' },
  { id: 'gcba', nombre: 'GCBA', disponible: false },
  { id: 'absa', nombre: 'ABSA', disponible: false },
];

export default function ClientesPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Redeterminaciones</h1>
            <p className="text-xs text-slate-500">Elegí un cliente</p>
          </div>
          <div className="flex items-center gap-4">
            {usuario && <span className="text-sm text-slate-500">{usuario}</span>}
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CLIENTES.map((c) => (
            <button
              key={c.id}
              onClick={() => c.disponible && c.ruta && navigate(c.ruta)}
              disabled={!c.disponible}
              className={`flex flex-col items-center justify-center gap-4 rounded-2xl border p-8 transition-colors ${
                c.disponible
                  ? 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm cursor-pointer'
                  : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
              }`}
            >
              {c.logo ? (
                <img
                  src={`${import.meta.env.BASE_URL}${c.logo}`}
                  alt={c.nombre}
                  className="h-12 w-auto"
                />
              ) : (
                <span className="w-14 h-14 rounded-full bg-slate-300 text-white flex items-center justify-center text-lg font-semibold">
                  {c.nombre.slice(0, 2)}
                </span>
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-900">{c.nombre}</p>
                {!c.disponible && (
                  <p className="text-xs text-slate-400 mt-0.5">Próximamente</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
