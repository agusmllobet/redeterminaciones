
import type { ContratacionData } from '../../lib/types';
import { armarFamilias, tarifaVigente } from '../../lib/familias';
import { formatMoney } from '../../lib/format';

export default function TabVigente({ data }: { data: ContratacionData }) {
  const familias = armarFamilias(data.ordenes);

  const filas = data.perfiles
    .map((p) => {
      for (const fam of familias) {
        const v = tarifaVigente(fam, p.id, data.tarifas);
        if (v) return { perfil: p, ...v };
      }
      return null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden max-w-2xl">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
        <p className="text-sm font-medium text-slate-900">Tarifa vigente hoy</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Última redeterminación aprobada por perfil
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left px-5 py-2.5 font-medium text-slate-500">Perfil</th>
            <th className="text-right px-4 py-2.5 font-medium text-slate-500">Tarifa</th>
            <th className="text-right px-5 py-2.5 font-medium text-slate-500">Origen</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ perfil, tarifa, origen }) => (
            <tr key={perfil.id} className="border-b border-slate-100 last:border-0">
              <td className="px-5 py-3 text-slate-700">{perfil.nombre}</td>
              <td className="text-right px-4 py-3 tabular-nums font-medium text-slate-900">
                {formatMoney(tarifa)}
              </td>
              <td className="text-right px-5 py-3 text-xs text-slate-400">
                {origen.tipo === 'madre'
                  ? `OC ${origen.numero} (inicial)`
                  : `OC ${origen.numero} · RDT ${origen.numero_rdt}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
