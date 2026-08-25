import type { OrdenCompra, Tarifa } from './types';

export type Familia = {
  madre: OrdenCompra;
  hijas: OrdenCompra[]; // ordenadas por numero_rdt asc
};

export function armarFamilias(ordenes: OrdenCompra[]): Familia[] {
  const madres = ordenes.filter((o) => o.tipo === 'madre');
  return madres.map((madre) => ({
    madre,
    hijas: ordenes
      .filter((o) => o.oc_madre_id === madre.id)
      .sort((a, b) => (a.numero_rdt || 0) - (b.numero_rdt || 0)),
  }));
}

// Tarifa vigente de un perfil dentro de una familia: la de la hija con
// mayor numero_rdt que tenga tarifa cargada para ese perfil; si ninguna
// hija tiene tarifa para ese perfil, cae a la tarifa inicial (madre).
export function tarifaVigente(
  familia: Familia,
  perfilId: string,
  tarifas: Tarifa[]
): { tarifa: number; origen: OrdenCompra } | null {
  const porOc = new Map(tarifas.map((t) => [`${t.orden_compra_id}:${t.perfil_id}`, t]));

  for (let i = familia.hijas.length - 1; i >= 0; i--) {
    const hija = familia.hijas[i];
    const t = porOc.get(`${hija.id}:${perfilId}`);
    if (t) return { tarifa: t.tarifa, origen: hija };
  }

  const t = porOc.get(`${familia.madre.id}:${perfilId}`);
  if (t) return { tarifa: t.tarifa, origen: familia.madre };

  return null;
}
