export type Perfil = {
  id: string;
  nombre: string;
  orden: number;
};

export type OrdenCompra = {
  id: string;
  numero: string;
  tipo: 'madre' | 'rdt';
  oc_madre_id: string | null;
  numero_rdt: number | null;
  mes_gatillo: string | null;
  fecha_oc: string | null;
};

export type Tarifa = {
  id: string;
  orden_compra_id: string;
  perfil_id: string;
  tarifa: number;
};

export type HoraMensual = {
  id: string;
  orden_compra_id: string;
  perfil_id: string;
  periodo: string; // yyyy-mm-01
  horas: number;
  tarifa_aplicada: number | null;
  total: number | null;
  facturado: boolean;
};

export type ContratacionData = {
  contratacion: {
    id: string;
    codigo: string;
    nombre: string;
    parg: string | null;
  };
  perfiles: Perfil[];
  ordenes: OrdenCompra[];
  tarifas: Tarifa[];
  horas: HoraMensual[];
};
