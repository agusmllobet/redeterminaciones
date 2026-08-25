import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';

const USUARIOS = [
  { id: 'agus', label: 'Agus' },
  { id: 'facturacion', label: 'Facturación' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function elegirUsuario(id: string) {
    setUsuario(id);
    setPin('');
    setError('');
  }

  function volver() {
    setUsuario(null);
    setPin('');
    setError('');
  }

  async function intentarLogin(pinCompleto: string) {
    if (!usuario) return;
    setLoading(true);
    setError('');
    try {
      await login(usuario, pinCompleto);
      navigate('/clientes');
    } catch {
      setError('Contraseña incorrecta');
      setPin('');
    } finally {
      setLoading(false);
    }
  }

  function apretarDigito(d: string) {
    if (loading) return;
    const nuevo = (pin + d).slice(0, 4);
    setPin(nuevo);
    setError('');
    if (nuevo.length === 4) intentarLogin(nuevo);
  }

  function borrar() {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white font-semibold text-lg mb-4">
            R
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Redeterminaciones</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de precios y facturación</p>
        </div>

        {!usuario && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <p className="text-sm font-medium text-slate-700 mb-1">¿Quién sos?</p>
            {USUARIOS.map((u) => (
              <button
                key={u.id}
                onClick={() => elegirUsuario(u.id)}
                className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3.5 text-left hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
                  {u.label[0]}
                </span>
                <span className="text-sm font-medium text-slate-900">{u.label}</span>
              </button>
            ))}
          </div>
        )}

        {usuario && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium">
                  {USUARIOS.find((u) => u.id === usuario)?.label[0]}
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {USUARIOS.find((u) => u.id === usuario)?.label}
                </span>
              </div>
              <button
                onClick={volver}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cambiar
              </button>
            </div>

            <p className="text-sm text-slate-500 text-center mb-4">Ingresá tu contraseña</p>

            <div className="flex items-center justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                    i < pin.length
                      ? 'bg-slate-900 border-slate-900'
                      : 'border-slate-300'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4 text-center">
                {error}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button
                  key={d}
                  onClick={() => apretarDigito(d)}
                  disabled={loading}
                  className="aspect-square rounded-xl bg-slate-50 hover:bg-slate-100 text-lg font-medium text-slate-900 transition-colors disabled:opacity-40"
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                onClick={() => apretarDigito('0')}
                disabled={loading}
                className="aspect-square rounded-xl bg-slate-50 hover:bg-slate-100 text-lg font-medium text-slate-900 transition-colors disabled:opacity-40"
              >
                0
              </button>
              <button
                onClick={borrar}
                disabled={loading}
                className="aspect-square rounded-xl bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-500 transition-colors disabled:opacity-40"
              >
                ⌫
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
