import { supabase } from './supabase';
import type { ContratacionData } from './types';

export async function traerDatosAusa(): Promise<ContratacionData> {
  const { data: cliente, error: eCliente } = await supabase
    .from('redet_clientes')
    .select('id')
    .eq('nombre', 'AUSA')
    .maybeSingle();
  if (eCliente) throw eCliente;
  if (!cliente) throw new Error('Cliente AUSA no encontrado');

  const { data: contratacion, error: eContr } = await supabase
    .from('redet_contrataciones')
    .select('id, codigo, nombre, parg')
    .eq('cliente_id', cliente.id)
    .limit(1)
    .maybeSingle();
  if (eContr) throw eContr;
  if (!contratacion) throw new Error('Contratación no encontrada');

  const [perfilesRes, ordenesRes, horasRes] = await Promise.all([
    supabase
      .from('redet_perfiles')
      .select('id, nombre, orden')
      .eq('contratacion_id', contratacion.id)
      .order('orden'),
    supabase
      .from('redet_ordenes_compra')
      .select('id, numero, tipo, oc_madre_id, numero_rdt, mes_gatillo, fecha_oc, archivo_url')
      .eq('contratacion_id', contratacion.id)
      .order('fecha_oc'),
    supabase
      .from('redet_horas_mensuales')
      .select('id, orden_compra_id, perfil_id, periodo, horas, tarifa_aplicada, total, facturado')
      .eq('contratacion_id', contratacion.id)
      .order('periodo'),
  ]);

  if (perfilesRes.error) throw perfilesRes.error;
  if (ordenesRes.error) throw ordenesRes.error;
  if (horasRes.error) throw horasRes.error;

  const ocIds = (ordenesRes.data || []).map((o) => o.id);
  const { data: tarifas, error: eTarifas } = await supabase
    .from('redet_tarifas')
    .select('id, orden_compra_id, perfil_id, tarifa')
    .in('orden_compra_id', ocIds.length ? ocIds : ['00000000-0000-0000-0000-000000000000']);
  if (eTarifas) throw eTarifas;

  return {
    contratacion,
    perfiles: perfilesRes.data || [],
    ordenes: ordenesRes.data || [],
    tarifas: tarifas || [],
    horas: horasRes.data || [],
  };
}

export async function cargarHorasMes(
  contratacionId: string,
  periodo: string,
  horasPorPerfil: Record<string, number>
): Promise<{ inserted: number; message?: string }> {
  const { data: tarifas, error: eTarifas } = await supabase
    .from('redet_tarifas')
    .select('orden_compra_id, perfil_id, tarifa, redet_ordenes_compra!inner(id, tipo, contratacion_id)')
    .eq('redet_ordenes_compra.contratacion_id', contratacionId)
    .eq('redet_ordenes_compra.tipo', 'rdt');
  if (eTarifas) throw eTarifas;

  const { data: existentes, error: eExist } = await supabase
    .from('redet_horas_mensuales')
    .select('orden_compra_id, perfil_id')
    .eq('contratacion_id', contratacionId)
    .eq('periodo', periodo);
  if (eExist) throw eExist;

  const existSet = new Set(
    (existentes || []).map((r) => `${r.orden_compra_id}:${r.perfil_id}`)
  );

  const rows: {
    contratacion_id: string;
    orden_compra_id: string;
    perfil_id: string;
    periodo: string;
    horas: number;
    tarifa_aplicada: number;
    total: number;
    facturado: boolean;
  }[] = [];

  for (const t of tarifas || []) {
    const hs = horasPorPerfil[t.perfil_id];
    if (!hs || hs <= 0) continue;
    const key = `${t.orden_compra_id}:${t.perfil_id}`;
    if (existSet.has(key)) continue;

    rows.push({
      contratacion_id: contratacionId,
      orden_compra_id: t.orden_compra_id,
      perfil_id: t.perfil_id,
      periodo,
      horas: hs,
      tarifa_aplicada: t.tarifa,
      total: Math.round(hs * t.tarifa * 100) / 100,
      facturado: false,
    });
  }

  if (rows.length === 0) {
    return {
      inserted: 0,
      message:
        'No había redeterminaciones pendientes para cargar en ese período (puede que ya estén cargadas).',
    };
  }

  const { error: eInsert } = await supabase.from('redet_horas_mensuales').insert(rows);
  if (eInsert) throw eInsert;

  return { inserted: rows.length };
}

export async function marcarFacturado(ids: string[]) {
  const { error } = await supabase
    .from('redet_horas_mensuales')
    .update({ facturado: true, updated_at: new Date().toISOString() })
    .in('id', ids);
  if (error) throw error;
}
