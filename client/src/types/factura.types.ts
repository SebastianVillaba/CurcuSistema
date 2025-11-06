export interface Cliente {
  idCliente?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  documento?: string;
  dv?: string;
}

export interface Conductor {
  idConductor?: number;
  nombre: string;
  documento?: string;
}

export interface ItemFactura {
  idProducto?: number;
  codigo?: string;
  nombreMercaderia?: string;
  descripcion?: string;
  origen: string;
  unidades: number;
  precio?: number;
  precioUnitario?: number;
  total: number;
  descuento: number;
  stock: number;
  nombreImpuesto?: string;
}

export interface Factura {
  idFactura?: number;
  numero: string;
  fecha: string;
  cliente: Cliente;
  conductor?: Conductor;
  condicion: 'CONTADO' | 'CENTRAL' | 'CENTRAL';
  tipo: 'Casa 1' | 'Casa 2';
  items: ItemFactura[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
  observaciones?: string;
  estado?: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
}

export interface BuscarFacturaParams {
  numero?: string;
  fecha?: string;
  cliente?: string;
}
