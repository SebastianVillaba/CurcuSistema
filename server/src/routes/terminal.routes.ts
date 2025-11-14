import { Router } from 'express';
import { validarTerminal } from '../controllers/terminal.controller';

const router = Router();

router.post('/validar', validarTerminal);

export default router;
