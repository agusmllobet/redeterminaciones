import type { ContratacionData } from '../../lib/types';
import { armarFamilias, tarifaVigente } from '../../lib/familias';
import { formatMoney } from '../../lib/format';

export default function TabEvolucion({ data }: { data: ContratacionData }) {
  const familias = armarFamilias(data.ordenes);
  const tarifaByOcPerfil = new Map(
    data.tarifas.map((t) => [`${t.orden_compra_id}:${t.perfil_id}`, t.tarifa])
  );

  return (
    <div className="space-y-8">
      {familias.map((fam) => {
        const columnas = [fam.madre, ...fam.hijas];
        const perfilesDeEstaFamilia = data.perfiles.filter((p) =>
          columnas.some((oc) => tarifaByOcPerfil.has(`${oc.id}:${p.id}`))
        );

        return (
          <div key={fam.madre.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <p className="text-sm font-medium text-slate-900">
                OC madre {fam.madre.numero}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-5 py-2.5 font-medium text-slate-500">Perfil</th>
                    <th className="text-right px-4 py-2.5 font-medium text-slate-900">
                      Tarifa vigente
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-slate-500">
                      Tarifa inicial
                    </th>
                    {fam.hijas.map((h) => (
                      <th key={h.id} className="text-right px-4 py-2.5 font-medium text-slate-500">
                        <div>Red {h.numero_rdt}</div>
                        <div className="text-xs font-normal text-slate-400">
                          {h.mes_gatillo}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {perfilesDeEstaFamilia.map((p) => {
                    const vigente = tarifaVigente(fam, p.id, data.tarifas);
                    return (
                      <tr key={p.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-5 py-2.5 text-slate-700">{p.nombre}</td>
                        <td className="text-right px-4 py-2.5 tabular-nums font-semibold text-slate-900">
                          {vigente ? formatMoney(vigente.tarifa) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        {columnas.map((oc) => {
                          const t = tarifaByOcPerfil.get(`${oc.id}:${p.id}`);
                          return (
                            <td key={oc.id} className="text-right px-4 py-2.5 tabular-nums text-slate-900">
                              {t !== undefined ? formatMoney(t) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
