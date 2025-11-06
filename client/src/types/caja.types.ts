export interface Caja {
  idCaja: number;
  nombre: string;
  estado: 0 | 1; // 0 = cerrada (rojo), 1 = abierta (verde)
  descripcion?: string;
}
