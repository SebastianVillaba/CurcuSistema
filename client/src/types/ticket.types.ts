export interface ItemFactura {
  cantidad: number;
  codigo: number;
  mercaderia: string;
  precio: number;
  subtotal: number;
  porcentajeImpuesto: number;
}

export interface ItemTicket {
  cantidad: number;
  codigo: number;
  mercaderia: string;
  precio: number;
  subtotal: number;
}

export interface DatosFactura {
  // Datos de la empresa
  nombreFantasia: string;
  empresaContable: string;
  rubro: string;
  ruc: string;
  direccion: string;
  telefono: string;
  
  // Datos de la venta
  fechaHora: Date;
  nroFactura: string;
  total: number;
  
  // Datos de control fiscal
  timbrado: string;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date;
  
  // Datos del cliente
  cliente: string;
  rucCliente: string;
  direccionCliente: string;
  telefonoCliente: string;
  
  // Información adicional
  vendedor: string;
  tipoFactura: string;
  formaVenta: string;
  
  // Liquidación IVA
  gravada10: number;
  gravada5: number;
  exenta: number;
  iva10: number;
  iva5: number;
  totalIva: number;
  
  // Items
  items: ItemFactura[];
}

export interface DatosTicket {
  // Datos de la empresa
  nombreFantasia: string;
  ruc: string;
  nombreSucursal: string;
  nombreTipoPago: string;

  // Datos de la venta
  fechaHora: Date;
  idVenta: number;
  total: number;

  // Datos del cliente
  cliente: string;
  rucCliente: string;

  // Información adicional
  vendedor: string;
  totalLetra: string;
  
  // Footer de la factura
  leyenda: string;
  
  // Items
  items: ItemTicket[];
}

