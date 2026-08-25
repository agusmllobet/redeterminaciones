import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ContratacionData } from '../lib/types';
import { traerDatosAusa } from '../lib/data';
import { logout } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import TabEvolucion from './ausa/TabEvolucion';
import TabVigente from './ausa/TabVigente';
import TabHistorial from './ausa/TabHistorial';
import TabCargarHoras from './ausa/TabCargarHoras';
import TabPendientes from './ausa/TabPendientes';
import TabOrdenes from './ausa/TabOrdenes';

type TabId = 'evolucion' | 'vigente' | 'historial' | 'cargar' | 'pendientes' | 'ordenes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'vigente', label: 'Tarifa vigente' },
  { id: 'evolucion', label: 'Evolución de tarifas' },
  { id: 'ordenes', label: 'Órdenes de compra' },
  { id: 'cargar', label: 'Cargar horas del mes' },
  { id: 'pendientes', label: 'Pendientes a facturar' },
  { id: 'historial', label: 'Historial mensual' },
];

export default function AusaPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [data, setData] = useState<ContratacionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabId>('vigente');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const d = await traerDatosAusa();
      setData(d);
      setError('');
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">AUSA</h1>
            <p className="text-xs text-slate-500">
              {data?.contratacion.parg} · {data?.contratacion.codigo}
            </p>
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

      <nav className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading && <p className="text-sm text-slate-500">Cargando…</p>}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        {data && !loading && (
          <>
            {tab === 'vigente' && <TabVigente data={data} />}
            {tab === 'evolucion' && <TabEvolucion data={data} />}
            {tab === 'ordenes' && <TabOrdenes data={data} />}
            {tab === 'cargar' && <TabCargarHoras data={data} onSaved={cargarDatos} />}
            {tab === 'pendientes' && <TabPendientes data={data} onMarcado={cargarDatos} />}
            {tab === 'historial' && <TabHistorial data={data} />}
          </>
        )}
      </main>
    </div>
  );
}
