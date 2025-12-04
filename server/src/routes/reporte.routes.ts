import express from 'express';
import { reporteFacturaVenta, reporteTicketVenta, reporteTicketPedidoDia, reporteCierreCaja, reporteTicketRemision } from '../controllers/reporte.controller';

const router = express.Router();

// Ruta para obtener el reporte de una factura
router.get('/factura', reporteFacturaVenta);

// Ruta para obtener el reporte de un ticket
router.get('/ticket', reporteTicketVenta);
router.get('/ticket-pedido', reporteTicketPedidoDia);
router.get('/cierre-caja', reporteCierreCaja);
router.get('/ticket-remision', reporteTicketRemision);

export default router;
