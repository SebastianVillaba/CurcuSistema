import { Router } from 'express';
import { 
  consultarCajas, 
  abrirCaja, 
  cerrarCaja, 
  agregarGastoCaja,
  consultarMovimientosPorCaja 
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

export default router;
