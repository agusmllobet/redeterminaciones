export function formatMoney(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const parts = rounded.toFixed(2).split('.');
  let intPart = parts[0];
  let decPart = parts[1];
  if (decPart === '00') decPart = '';
  else if (decPart.endsWith('0')) decPart = decPart.slice(0, 1);

  const negative = intPart.startsWith('-');
  if (negative) intPart = intPart.slice(1);
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${negative ? '-' : ''}$${intPart}${decPart ? ',' + decPart : ''}`;
}

export function formatHoras(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0$/, '').replace('.', ',');
}

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

const MESES_TITLE = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function periodoLabel(periodo: string, upper = true): string {
  // periodo viene como 'yyyy-mm-dd'
  const [y, m] = periodo.split('-').map(Number);
  const nombre = upper ? MESES[m - 1] : MESES_TITLE[m - 1];
  return `${nombre} ${y}`;
}

export function periodoCorto(periodo: string): string {
  const [y, m] = periodo.split('-').map(Number);
  return `${MESES_TITLE[m - 1]} ${y}`;
}
