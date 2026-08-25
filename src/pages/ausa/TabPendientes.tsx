import { useMemo, useState } from 'react';
import type { ContratacionData } from '../../lib/types';
import {
  agruparPendientes,
  generarBloqueTexto,
  generarTextoCompleto,
} from '../../lib/textoGenerator';
import { formatMoney, periodoCorto } from '../../lib/format';
import { marcarFacturado, borrarHoras } from '../../lib/data';

export default function TabPendientes({
  data,
  onMarcado,
}: {
  data: ContratacionData;
  onMarcado: () => void;
}) {
  const ordenesById = useMemo(
    () => new Map(data.ordenes.map((o) => [o.id, o])),
    [data.ordenes]
  );
  const perfilesById = useMemo(
    () => new Map(data.perfiles.map((p) => [p.id, p])),
    [data.perfiles]
  );

  const bloques = useMemo(
    () => agruparPendientes(data.horas, ordenesById),
    [data.horas, ordenesById]
  );

  const [seleccion, setSeleccion] = useState<Set<string>>(
    () => new Set(bloques.map((b) => b.key))
  );
  const [copiado, setCopiado] = useState(false);
  const [marcando, setMarcando] = useState(false);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState<string | null>(null);

  const bloquesSeleccionados = bloques.filter((b) => seleccion.has(b.key));
  const totalGeneral = bloquesSeleccionados.reduce((s, b) => s + b.total, 0);

  function toggle(key: string) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function copiarTodo() {
    const texto = generarTextoCompleto(bloquesSeleccionados, perfilesById);
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function handleMarcarFacturado() {
    const ids = bloquesSeleccionados.flatMap((b) => b.filas.map((f) => f.id));
    if (ids.length === 0) return;
    setMarcando(true);
    try {
      await marcarFacturado(ids);
      onMarcado();
    } finally {
      setMarcando(false);
    }
  }

  async function handleBorrar(key: string) {
    const bloque = bloques.find((b) => b.key === key);
    if (!bloque) return;
    setBorrando(key);
    try {
      await borrarHoras(bloque.filas.map((f) => f.id));
      onMarcado();
    } finally {
      setBorrando(null);
      setConfirmarBorrado(null);
    }
  }

  if (bloques.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No hay redeterminaciones pendientes a facturar. Cargá horas en la pestaña
        correspondiente para generar nuevas.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-900">
            {bloques.length} redeterminaciones pendientes
          </p>
          <p className="text-sm tabular-nums text-slate-500">
            Total: {formatMoney(totalGeneral)}
          </p>
        </div>

        {bloques.map((b) => (
          <div
            key={b.key}
            className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-slate-300 transition-colors"
          >
            <input
              type="checkbox"
              checked={seleccion.has(b.key)}
              onChange={() => toggle(b.key)}
              className="mt-1"
            />
            <label className="flex-1 min-w-0 cursor-pointer" onClick={() => toggle(b.key)}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">
                  OC {b.orden.numero} · RDT {b.orden.numero_rdt}
                </p>
                <p className="text-sm tabular-nums text-slate-700">
                  {formatMoney(b.total)}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{periodoCorto(b.periodo)}</p>
            </label>
            {confirmarBorrado === b.key ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleBorrar(b.key)}
                  disabled={borrando === b.key}
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                >
                  {borrando === b.key ? 'Borrando…' : 'Confirmar'}
                </button>
                <button
                  onClick={() => setConfirmarBorrado(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmarBorrado(b.key)}
                className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                title="Borrar esta carga"
              >
                🗑
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={copiarTodo}
            disabled={bloquesSeleccionados.length === 0}
            className="flex-1 bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            {copiado ? '¡Copiado!' : 'Generar y copiar textos'}
          </button>
          <button
            onClick={handleMarcarFacturado}
            disabled={bloquesSeleccionados.length === 0 || marcando}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            {marcando ? 'Marcando…' : 'Marcar como facturado'}
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 max-h-[600px] overflow-y-auto">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
            {bloquesSeleccionados
              .map((b) => generarBloqueTexto(b, perfilesById))
              .join('\n\n')}
          </pre>
        </div>
      </div>
    </div>
  );
}
