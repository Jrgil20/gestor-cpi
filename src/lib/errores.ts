// Traducción de los errores técnicos más comunes a mensajes útiles en español.
const TRADUCCIONES: [RegExp, string][] = [
  [/failed to fetch|network ?error|load failed/i, 'Sin conexión con el servidor'],
  [/invalid login credentials/i, 'Correo o contraseña incorrectos'],
  [/email not confirmed/i, 'El correo no está confirmado'],
  [/jwt expired|refresh_token/i, 'La sesión expiró: vuelve a iniciar sesión'],
]

export function mensajeDeError(err: unknown): string {
  // Los errores de Supabase (PostgrestError) traen .message sin ser instanceof Error.
  const crudo =
    typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
      ? err.message
      : String(err)
  const traduccion = TRADUCCIONES.find(([patron]) => patron.test(crudo))
  return traduccion ? traduccion[1] : crudo
}
