import { useState } from 'react';
import type { ContratacionData } from '../../lib/types';
import { supabase } from '../../lib/supabase';

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

  const ordenadas = [...data.ordenes].sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === 'madre' ? -1 : 1;
    return (a.fecha_oc || '').localeCompare(b.fecha_oc || '');
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden max-w-3xl">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
        <p className="text-sm font-medium text-slate-900">Órdenes de compra</p>
        <p className="text-xs text-slate-500 mt-0.5">
          OC madres y sus redeterminaciones, con el PDF original
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
          {ordenadas.map((o) => (
            <tr key={o.id} className="border-b border-slate-100 last:border-0">
              <td className="px-5 py-2.5 text-slate-900 font-medium">{o.numero}</td>
              <td className="px-4 py-2.5 text-slate-600">
                {o.tipo === 'madre' ? 'OC madre' : `RDT ${o.numero_rdt}`}
              </td>
              <td className="px-4 py-2.5 text-slate-500">{o.fecha_oc || '—'}</td>
              <td className="text-right px-5 py-2.5">
                <button
                  onClick={() => descargar(o.id, o.archivo_url)}
                  disabled={descargando === o.id}
                  className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2 disabled:opacity-40"
                >
                  {descargando === o.id ? 'Abriendo…' : 'Descargar'}
                </button>
                {errorId === o.id && (
                  <p className="text-xs text-red-500 mt-1">Todavía no está subido</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
