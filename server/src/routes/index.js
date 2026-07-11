import { Router } from 'express';
import healthRouter from './health.js';
import configRoutes from './configRoutes.js';
import profileRoutes from './profileRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import chatRoutes from './chatRoutes.js';
import endSessionRoutes from './endSessionRoutes.js';
import historyRoutes from './historyRoutes.js';
import statisticsRoutes from './statisticsRoutes.js';

const router = Router();

router.use('/health', healthRouter);

router.use('/config', configRoutes);
router.use('/profile', profileRoutes);
router.use('/session', sessionRoutes);
router.use('/chat', chatRoutes);
router.use('/end-session', endSessionRoutes);
router.use('/history', historyRoutes);
router.use('/statistics', statisticsRoutes);

export default router;
