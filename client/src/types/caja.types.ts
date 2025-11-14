export interface Caja {
  idCaja: number;
  nombreCaja: string;
  activo: boolean;
  estadoCaja: boolean; // false = cerrada, true = abierta
}

export interface MovimientoCaja {
  idMovimientoCaja: number;
  fechaApertura: string;
  fechaCierre: string | null;
}
