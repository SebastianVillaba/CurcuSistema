import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const distribucionService = {
  // 1. Zonas de Entrega
  getZonas: async () => {
    const response = await axios.get(`${API_URL}/distribucion/zonas`);
    return response.data;
  },

  guardarZona: async (zona: {
    idZonaEntrega?: number;
    nombre: string;
    descripcion?: string;
    color: string;
    limites: [number, number][];
    costoEnvio: number;
    idDeliveryDefecto?: number;
    idUsuario: number;
  }) => {
    const response = await axios.post(`${API_URL}/distribucion/zonas`, zona);
    return response.data;
  },

  eliminarZona: async (idZonaEntrega: number, idUsuario: number) => {
    const response = await axios.delete(`${API_URL}/distribucion/zonas/${idZonaEntrega}`, {
      params: { idUsuario }
    });
    return response.data;
  },

  // 2. Pedidos Pendientes para Despacho
  getPedidosPendientes: async (fecha: string) => {
    const response = await axios.get(`${API_URL}/distribucion/pedidos-pendientes`, {
      params: { fecha }
    });
    return response.data;
  },

  // 3. Hojas de Ruta
  guardarHojaRuta: async (hojaRuta: {
    idHojaRuta?: number;
    idDelivery: number;
    fechaRuta: string;
    observacion?: string;
    idUsuario: number;
    pedidos: { idPedido: number; orden: number }[];
  }) => {
    const response = await axios.post(`${API_URL}/distribucion/hojas-ruta`, hojaRuta);
    return response.data;
  },

  getHojasRuta: async (fecha?: string) => {
    const response = await axios.get(`${API_URL}/distribucion/hojas-ruta`, {
      params: { fecha }
    });
    return response.data;
  },

  getDetalleHojaRuta: async (idHojaRuta: number) => {
    const response = await axios.get(`${API_URL}/distribucion/hojas-ruta/${idHojaRuta}`);
    return response.data;
  },

  anularHojaRuta: async (idHojaRuta: number, idUsuario: number) => {
    const response = await axios.put(`${API_URL}/distribucion/hojas-ruta/${idHojaRuta}/anular`, {
      idUsuario
    });
    return response.data;
  },

  // 4. Geolocalización de Cliente
  actualizarGeolocalizacion: async (idPersona: number, latitud: number, longitud: number) => {
    const response = await axios.put(`${API_URL}/distribucion/cliente-geolocalizacion`, {
      idPersona,
      latitud,
      longitud
    });
    return response.data;
  },

  // 5. Descargar/Imprimir PDF de Hoja de Ruta
  imprimirHojaRuta: (idHojaRuta: number) => {
    const url = `${API_URL}/distribucion/hojas-ruta/${idHojaRuta}/pdf`;
    window.open(url, '_blank');
  }
};
