import express from 'express';
import { buscarInfoPersona, buscarPersona, insertarPersona } from '../controllers/persona.controller';

const router = express.Router();

// La ruta base ya es '/persona' desde index.ts
// Entonces '/' aquí se traduce a '/api/persona'
router.post('/', insertarPersona);
router.get('/consulta', buscarPersona);
router.get('/info', buscarInfoPersona);

export default router;