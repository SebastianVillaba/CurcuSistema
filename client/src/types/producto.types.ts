export interface Producto {
  idProducto?: number;
  nombre: string;
  presentacion: string;
  codigo: string;
  codigoBarra: string;
  precio: number;
  costo: number;
  idTipoProducto: number;
  idUsuarioAlta?: number;
}

export interface TipoProducto {
  idTipoProducto: number;
  nombre: string;
}
