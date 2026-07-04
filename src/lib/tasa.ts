// Última tasa Bs/USD usada (localStorage): los formularios la precargan para
// evitar el error de registrar montos en Bs con la tasa por defecto en 1.
const KEY = 'gestor-cpi:ultima-tasa'

export function getUltimaTasa(): number {
  const valor = Number(localStorage.getItem(KEY))
  return Number.isFinite(valor) && valor > 0 ? valor : 1
}

export function guardarUltimaTasa(tasa: number): void {
  if (Number.isFinite(tasa) && tasa > 0) {
    localStorage.setItem(KEY, String(tasa))
  }
}
