import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const reporteService = {
  /**
   * Obtiene los datos de una factura para imprimir
   */
  obtenerDatosFactura: async (idVenta: number): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reporte/factura`,
        {
          params: {
            idVenta
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener datos de factura:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener datos de factura');
    }
  },

  /**
   * Obtiene los datos de un ticket para imprimir
   */
  obtenerDatosTicket: async (idVenta: number): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reporte/ticket`,
        {
          params: {
            idVenta
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener datos de ticket:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener datos de ticket');
    }
  }
};
