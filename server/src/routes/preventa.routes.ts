import { Router } from 'express';
import {
  guardarPreventa,
  recargarPreventa,
  listarPreventasPendientes,
  reporteTicketPreventa
} from '../controllers/preventa.controller';

const router = Router();

// Ruta para guardar una preventa
router.post('/guardar', guardarPreventa);

// Ruta para recargar una preventa (cargar items al temporal y marcar procesado)
router.post('/recargar', recargarPreventa);

// Ruta para listar preventas pendientes
router.get('/pendientes', listarPreventasPendientes);

// Ruta para obtener reporte de ticket de una preventa
router.get('/ticket', reporteTicketPreventa);

export default router;
