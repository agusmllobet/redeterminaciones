import { formatMoney, formatHoras, periodoLabel } from './format';
import type { HoraMensual, OrdenCompra, Perfil } from './types';

const DISPLAY_PERFIL: Record<string, string> = {
  'Project Manager': 'PM',
  'Desarrollador ABAP': 'ABAP',
  'Consultor SAP': 'CONSULTOR SAP',
  'Liquidador de Sueldo': 'LIQ DE SUELDOS',
};

export type BloquePendiente = {
  key: string; // orden_compra_id + periodo
  orden: OrdenCompra;
  periodo: string;
  filas: HoraMensual[];
  total: number;
};

export function agruparPendientes(
  horas: HoraMensual[],
  ordenesById: Map<string, OrdenCompra>
): BloquePendiente[] {
  const grupos = new Map<string, BloquePendiente>();

  for (const h of horas) {
    if (h.facturado) continue;
    const orden = ordenesById.get(h.orden_compra_id);
    if (!orden) continue;
    const key = `${h.orden_compra_id}:${h.periodo}`;
    if (!grupos.has(key)) {
      grupos.set(key, { key, orden, periodo: h.periodo, filas: [], total: 0 });
    }
    const g = grupos.get(key)!;
    g.filas.push(h);
    g.total += h.total || 0;
  }

  return Array.from(grupos.values()).sort((a, b) => {
    if (a.periodo !== b.periodo) return a.periodo.localeCompare(b.periodo);
    return a.orden.numero.localeCompare(b.orden.numero);
  });
}

export function generarBloqueTexto(
  bloque: BloquePendiente,
  perfilesById: Map<string, Perfil>
): string {
  const lineas: string[] = [];
  lineas.push(formatMoney(bloque.total));
  lineas.push(`Desarrollo SAP ${bloque.orden.numero_rdt}°RDT`);
  lineas.push(`Periodo ${periodoLabel(bloque.periodo)}`);
  lineas.push(`OC#${bloque.orden.numero}`);

  const filasOrdenadas = [...bloque.filas].sort((a, b) => {
    const pa = perfilesById.get(a.perfil_id)?.orden ?? 0;
    const pb = perfilesById.get(b.perfil_id)?.orden ?? 0;
    return pa - pb;
  });

  for (const f of filasOrdenadas) {
    const perfil = perfilesById.get(f.perfil_id);
    const nombre = perfil ? DISPLAY_PERFIL[perfil.nombre] || perfil.nombre : '';
    lineas.push(
      `${nombre} ${formatHoras(f.horas)}HS A ${formatMoney(f.tarifa_aplicada || 0)}`
    );
  }

  return lineas.join('\n');
}

export function generarTextoCompleto(
  bloques: BloquePendiente[],
  perfilesById: Map<string, Perfil>
): string {
  return bloques.map((b) => generarBloqueTexto(b, perfilesById)).join('\n\n');
}
