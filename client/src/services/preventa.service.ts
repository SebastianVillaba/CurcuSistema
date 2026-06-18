import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface GuardarPreventaRequest {
  idUsuarioAlta: number;
  idTerminalWeb: number;
  idCliente: number;
  ruc: string;
  nombreCliente: string;
  totalVenta: number;
  totalDescuento: number;
}

export const preventaService = {
  /**
   * Guarda una preventa (lleva el detalle de la venta temporal a preventa)
   */
  guardarPreventa: async (data: GuardarPreventaRequest): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/preventa/guardar`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error al guardar preventa:', error);
      throw error;
    }
  },

  /**
   * Recarga una preventa (vuelve a meter los items de preventa al temporal y la marca procesada)
   */
  recargarPreventa: async (idTerminalWeb: number, idUsuario: number, idPreventa: number): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/preventa/recargar`, {
        idTerminalWeb,
        idUsuario,
        idPreventa
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al recargar preventa:', error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de preventas activas y no procesadas
   */
  obtenerPreventasPendientes: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/preventa/pendientes`);
      return response.data.result;
    } catch (error: any) {
      console.error('Error al obtener preventas pendientes:', error);
      throw error;
    }
  },

  /**
   * Obtiene la información necesaria para el reporte de ticket de la preventa
   */
  obtenerDatosTicketPreventa: async (idPreventa: number): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/preventa/ticket`, {
        params: { idPreventa }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener datos de ticket de preventa:', error);
      throw error;
    }
  }
};
