import { useState, type FormEvent } from 'react';
import type { ContratacionData } from '../../lib/types';
import { cargarHorasMes } from '../../lib/data';

function mesActualISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function TabCargarHoras({
  data,
  onSaved,
}: {
  data: ContratacionData;
  onSaved: () => void;
}) {
  const [periodo, setPeriodo] = useState(mesActualISO());
  const [horas, setHoras] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(
    null
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);

    const horasNumericas: Record<string, number> = {};
    for (const [perfilId, val] of Object.entries(horas)) {
      const n = parseFloat(val.replace(',', '.'));
      if (!isNaN(n) && n > 0) horasNumericas[perfilId] = n;
    }

    if (Object.keys(horasNumericas).length === 0) {
      setMensaje({ tipo: 'error', texto: 'Cargá al menos las horas de un perfil.' });
      setEnviando(false);
      return;
    }

    try {
      const res = await cargarHorasMes(data.contratacion.id, periodo, horasNumericas);
      if (res.inserted === 0) {
        setMensaje({ tipo: 'error', texto: res.message || 'No se cargó nada.' });
      } else {
        setMensaje({
          tipo: 'ok',
          texto: `Se generaron ${res.inserted} redeterminaciones para facturar. Mirá la pestaña "Pendientes a facturar".`,
        });
        setHoras({});
        onSaved();
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar. Probá de nuevo.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Período</label>
          <input
            type="month"
            value={periodo.slice(0, 7)}
            onChange={(e) => setPeriodo(`${e.target.value}-01`)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-3">
          {data.perfiles.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3">
              <label className="text-sm text-slate-700">{p.nombre}</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={horas[p.id] || ''}
                onChange={(e) => setHoras((h) => ({ ...h, [p.id]: e.target.value }))}
                className="w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          ))}
        </div>

        {mensaje && (
          <p
            className={`text-sm rounded-lg px-3 py-2 border ${
              mensaje.tipo === 'ok'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}
          >
            {mensaje.texto}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          {enviando ? 'Calculando…' : 'Calcular redeterminaciones'}
        </button>
        <p className="text-xs text-slate-400">
          Se van a generar automáticamente los montos para cada redeterminación
          pendiente de aprobación que corresponda a estas horas.
        </p>
      </form>
    </div>
  );
}
