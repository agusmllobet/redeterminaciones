
import { useState } from 'react';
import type { ContratacionData } from '../../lib/types';
import { formatMoney, formatHoras, periodoCorto } from '../../lib/format';

export default function TabHistorial({ data }: { data: ContratacionData }) {
  const perfilesById = new Map(data.perfiles.map((p) => [p.id, p]));
  const ordenesById = new Map(data.ordenes.map((o) => [o.id, o]));

  const periodos = Array.from(new Set(data.horas.map((h) => h.periodo))).sort(
    (a, b) => b.localeCompare(a)
  );

  const [abierto, setAbierto] = useState<string | null>(periodos[0] || null);

  return (
    <div className="space-y-3">
      {periodos.length === 0 && (
        <p className="text-sm text-slate-500">Todavía no hay meses cargados.</p>
      )}
      {periodos.map((periodo) => {
        const filas = data.horas
          .filter((h) => h.periodo === periodo)
          .sort((a, b) => {
            const oa = ordenesById.get(a.orden_compra_id)?.numero || '';
            const ob = ordenesById.get(b.orden_compra_id)?.numero || '';
            return oa.localeCompare(ob);
          });
        const totalMes = filas.reduce((s, f) => s + (f.total || 0), 0);
        const abiertoAca = abierto === periodo;

        return (
          <div key={periodo} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setAbierto(abiertoAca ? null : periodo)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-900">
                {periodoCorto(periodo)}
              </span>
              <span className="text-sm tabular-nums text-slate-600">
                {formatMoney(totalMes)}
              </span>
            </button>
            {abiertoAca && (
              <table className="w-full text-sm border-t border-slate-100">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-2 font-medium text-slate-500">OC</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-500">Perfil</th>
                    <th className="text-right px-4 py-2 font-medium text-slate-500">Horas</th>
                    <th className="text-right px-4 py-2 font-medium text-slate-500">Tarifa</th>
                    <th className="text-right px-4 py-2 font-medium text-slate-500">Total</th>
                    <th className="text-right px-5 py-2 font-medium text-slate-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f) => {
                    const oc = ordenesById.get(f.orden_compra_id);
                    const perfil = perfilesById.get(f.perfil_id);
                    return (
                      <tr key={f.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-5 py-2 text-slate-600">
                          {oc?.numero}
                          {oc?.numero_rdt ? (
                            <span className="text-slate-400"> · RDT{oc.numero_rdt}</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-2 text-slate-700">{perfil?.nombre}</td>
                        <td className="text-right px-4 py-2 tabular-nums text-slate-700">
                          {formatHoras(f.horas)}
                        </td>
                        <td className="text-right px-4 py-2 tabular-nums text-slate-500">
                          {formatMoney(f.tarifa_aplicada || 0)}
                        </td>
                        <td className="text-right px-4 py-2 tabular-nums font-medium text-slate-900">
                          {formatMoney(f.total || 0)}
                        </td>
                        <td className="text-right px-5 py-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              f.facturado
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {f.facturado ? 'Facturado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}
