import { Router } from 'express';
import { 
  consultarCajas, 
  abrirCaja, 
  cerrarCaja, 
  agregarGastoCaja,
  consultarMovimientosPorCaja, 
  agregarArqueoCajaTmp,
  listarArqueoCajaTmp,
  eliminarArqueoCajaTmp
} from '../controllers/caja.controller';

const router = Router();

// Ruta para consultar las cajas disponibles
router.get('/consultar', consultarCajas);

// Ruta para abrir una caja
router.post('/abrir', abrirCaja);

// Ruta para cerrar una caja
router.post('/cerrar', cerrarCaja);

// Ruta para agregar un gasto a la caja
router.post('/gasto', agregarGastoCaja);

// Ruta para consultar los movimientos de una caja específica
router.get('/movimientos', consultarMovimientosPorCaja);

// Ruta para agregar los detalles al arqueo de caja
router.post('/agregarArqueoCajaTmp', agregarArqueoCajaTmp);

// Ruta para listar los detalles del arqueo de la caja
router.get('/listarArqueoCajaTmp', listarArqueoCajaTmp);

// Ruta para eliminar un arqueo de caja
router.delete('/eliminarArqueoCajaTmp', eliminarArqueoCajaTmp);

export default router;
