import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TERMINAL_TOKEN_KEY = 'terminalToken';

/**
 * Obtiene el token de la terminal desde localStorage o genera uno nuevo.
 * @returns El token de la terminal.
 */
export const obtenerOgenerarToken = (): string => {
  let token = localStorage.getItem(TERMINAL_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TERMINAL_TOKEN_KEY, token);
  }
  return token;
};

/**
 * Valida el token de la terminal con el backend.
 * @param token - El token de la terminal a validar.
 * @returns La respuesta del servidor.
 */
export const validarTerminal = async (token: string) => {
  const response = await axios.post(`${API_BASE_URL}/terminal/validar`, { terminalToken: token });
  return response.data;
};
