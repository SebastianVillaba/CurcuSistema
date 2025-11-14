import express from 'express';
import { reporteFacturaVenta, reporteTicketVenta } from '../controllers/reporte.controller';

const router = express.Router();

// Ruta para obtener el reporte de una factura
router.get('/factura', reporteFacturaVenta);

// Ruta para obtener el reporte de un ticket
router.get('/ticket', reporteTicketVenta);

export default router;
