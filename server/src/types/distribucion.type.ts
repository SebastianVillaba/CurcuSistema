export interface ZonaEntrega {
  idZonaEntrega?: number;
  nombre: string;
  descripcion?: string;
  color: string;
  limites: string; // JSON string: [[lat, lng], ...]
  costoEnvio: number;
  idDeliveryDefecto?: number;
  activo?: boolean;
  nombreDeliveryDefecto?: string;
}

export interface GuardarZonaRequest {
  idZonaEntrega?: number;
  nombre: string;
  descripcion?: string;
  color: string;
  limites: any[]; // Array de coordenadas para guardar como JSON
  costoEnvio: number;
  idDeliveryDefecto?: number;
  idUsuario: number;
}

export interface DetHojaRuta {
  idDetHojaRuta?: number;
  idHojaRuta: number;
  idPedido: number;
  orden: number;
  activo?: boolean;
  
  // Datos del pedido (adaptados a los SPs modificados)
  nroPedido?: string;
  fecha?: string;
  fechaEntrega?: string;
  total?: number;
  totalPedido?: number;
  direccionPedido?: string;
  idCliente?: number;
  idPersona?: number;
  nombreCliente?: string;
  apellidoCliente?: string;
  telefono?: string;
  celular?: string;
  latitud?: number;
  longitud?: number;
  observacion?: string;
}

export interface HojaRuta {
  idHojaRuta?: number;
  nroHojaRuta: string;
  idDelivery: number;
  fechaRuta: string; // YYYY-MM-DD
  estado: string; // 'Borrador', 'En Camino', 'Completado', 'Anulado'
  observacion?: string;
  nombreDelivery?: string;
  cantidadPedidos?: number;
  detalles?: DetHojaRuta[];
}

export interface GuardarHojaRutaRequest {
  idHojaRuta?: number;
  nroHojaRuta?: string;
  idDelivery: number;
  fechaRuta: string; // YYYY-MM-DD
  observacion?: string;
  idUsuario: number;
  pedidos: {
    idPedido: number;
    orden: number;
  }[];
}
