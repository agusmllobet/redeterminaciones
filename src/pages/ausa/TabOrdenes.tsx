import { useState, Fragment } from 'react';
import type { ContratacionData } from '../../lib/types';
import { supabase } from '../../lib/supabase';
import { armarFamilias } from '../../lib/familias';

export default function TabOrdenes({ data }: { data: ContratacionData }) {
  const [descargando, setDescargando] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function descargar(id: string, archivoUrl: string | null) {
    if (!archivoUrl) return;
    setDescargando(id);
    setErrorId(null);
    try {
      const { data: signed, error } = await supabase.storage
        .from('redet-ocs')
        .createSignedUrl(archivoUrl, 60);
      if (error || !signed) throw error || new Error('sin url');
      window.open(signed.signedUrl, '_blank');
    } catch {
      setErrorId(id);
    } finally {
      setDescargando(null);
    }
  }

  const familias = armarFamilias(data.ordenes);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden max-w-3xl">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
        <p className="text-sm font-medium text-slate-900">Órdenes de compra</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Cada OC madre con sus redeterminaciones, y el PDF original de cada una
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left px-5 py-2.5 font-medium text-slate-500">OC</th>
            <th className="text-left px-4 py-2.5 font-medium text-slate-500">Tipo</th>
            <th className="text-left px-4 py-2.5 font-medium text-slate-500">Fecha</th>
            <th className="text-right px-5 py-2.5 font-medium text-slate-500">PDF</th>
          </tr>
        </thead>
        <tbody>
          {familias.map((fam) => (
            <Fragment key={fam.madre.id}>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <td className="px-5 py-2.5 text-slate-900 font-semibold">
                  {fam.madre.numero}
                </td>
                <td className="px-4 py-2.5 text-slate-600 font-medium">OC madre</td>
                <td className="px-4 py-2.5 text-slate-500">{fam.madre.fecha_oc || '—'}</td>
                <td className="text-right px-5 py-2.5">
                  <button
                    onClick={() => descargar(fam.madre.id, fam.madre.archivo_url)}
                    disabled={descargando === fam.madre.id}
                    className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2 disabled:opacity-40"
                  >
                    {descargando === fam.madre.id ? 'Abriendo…' : 'Descargar'}
                  </button>
                  {errorId === fam.madre.id && (
                    <p className="text-xs text-red-500 mt-1">Todavía no está subido</p>
                  )}
                </td>
              </tr>
              {fam.hijas.map((h) => (
                <tr key={h.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-2.5 pl-9 text-slate-700">
                    <span className="text-slate-300 mr-1.5">↳</span>
                    {h.numero}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    RDT {h.numero_rdt}
                    {h.mes_gatillo && (
                      <span className="text-slate-400"> · desde {h.mes_gatillo}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{h.fecha_oc || '—'}</td>
                  <td className="text-right px-5 py-2.5">
                    <button
                      onClick={() => descargar(h.id, h.archivo_url)}
                      disabled={descargando === h.id}
                      className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2 disabled:opacity-40"
                    >
                      {descargando === h.id ? 'Abriendo…' : 'Descargar'}
                    </button>
                    {errorId === h.id && (
                      <p className="text-xs text-red-500 mt-1">Todavía no está subido</p>
                    )}
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
