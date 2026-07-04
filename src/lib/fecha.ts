// Fecha local del dispositivo en formato YYYY-MM-DD. No usar toISOString():
// devuelve la fecha UTC, que después de las 8 p. m. en UTC−4 ya es "mañana".
export function hoyLocal(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}
