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
  { id: 'gcba', nombre: 'GCBA', logo: 'logo-gcba.png', disponible: false },
  { id: 'absa', nombre: 'ABSA', logo: 'logo-absa.png', disponible: false },
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

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CLIENTES.map((c) => (
            <button
              key={c.id}
              onClick={() => c.disponible && c.ruta && navigate(c.ruta)}
              disabled={!c.disponible}
              className={`group relative flex flex-col items-center gap-5 rounded-2xl border bg-white p-8 pt-10 transition-all ${
                c.disponible
                  ? 'border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer'
                  : 'border-slate-200 cursor-not-allowed'
              }`}
            >
              <div
                className={`flex items-center justify-center w-full h-20 rounded-xl ${
                  c.id === 'absa' ? 'bg-slate-800' : ''
                }`}
              >
                {c.logo ? (
                  <img
                    src={`${import.meta.env.BASE_URL}${c.logo}`}
                    alt={c.nombre}
                    className={`w-auto object-contain ${
                      c.id === 'absa' ? 'max-h-14 max-w-[65%]' : 'max-h-16 max-w-[75%]'
                    }`}
                  />
                ) : (
                  <span className="w-16 h-16 rounded-full bg-slate-300 text-white flex items-center justify-center text-xl font-semibold">
                    {c.nombre.slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p
                  className={`text-sm font-semibold ${
                    c.disponible ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {c.nombre}
                </p>
                {!c.disponible && (
                  <p className="text-xs text-slate-400 mt-1">Próximamente</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
