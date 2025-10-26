import express from 'express';
import { insertarProducto } from '../controllers/producto.controller';

const router = express.Router();

router.post('/', insertarProducto);

export default router;