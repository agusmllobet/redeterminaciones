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

// Tarifa vigente de un perfil dentro de una familia: la suma de la
// tarifa inicial (madre) mas todas las redeterminaciones (Red 1, Red 2,
// Red 3...) que tengan tarifa cargada para ese perfil.
export function tarifaVigente(
  familia: Familia,
  perfilId: string,
  tarifas: Tarifa[]
): { tarifa: number } | null {
  const porOc = new Map(tarifas.map((t) => [`${t.orden_compra_id}:${t.perfil_id}`, t]));

  let suma = 0;
  let encontroAlguna = false;

  const inicial = porOc.get(`${familia.madre.id}:${perfilId}`);
  if (inicial) {
    suma += inicial.tarifa;
    encontroAlguna = true;
  }

  for (const hija of familia.hijas) {
    const t = porOc.get(`${hija.id}:${perfilId}`);
    if (t) {
      suma += t.tarifa;
      encontroAlguna = true;
    }
  }

  if (!encontroAlguna) return null;
  return { tarifa: suma };
}
