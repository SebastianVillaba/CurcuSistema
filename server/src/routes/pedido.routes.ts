import { Router } from 'express';
import { agregarDetPedidoTmp, guardarPedidoFinal, consultaPedidosDia, consultarDetallePedido, eliminarDetallePedido } from '../controllers/pedido.controller';
//import { authMiddleware } from '../Middlewares/auth.middleware';

const router = Router();

router.post('/detalle', agregarDetPedidoTmp);
router.get('/detalle', consultarDetallePedido);
router.delete('/detalle', eliminarDetallePedido);
router.post('/', guardarPedidoFinal);
router.get('/dia', consultaPedidosDia);

export default router;
