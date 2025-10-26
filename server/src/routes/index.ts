import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import personaRoutes from './persona.routes';
import productoRoutes from './producto.routes'

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/persona', personaRoutes);
router.use('/producto', productoRoutes)

export default router;