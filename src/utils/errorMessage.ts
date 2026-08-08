import axios from 'axios';

// Las pantallas de auth (login, registro, recuperar contraseña...) usan esto en
// vez de siempre mostrar el mismo "ocurrió un error": distingue si el servidor
// respondió con un mensaje concreto (credenciales inválidas, correo duplicado,
// enlace expirado...) de si la petición ni siquiera llegó a tener respuesta
// (servidor apagado, sin internet, CORS bloqueado).
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return error.response.data?.message || fallback;
    }
    return 'No se pudo conectar con el servidor. Revisa tu conexión a internet o que el servidor esté encendido.';
  }
  return fallback;
}
