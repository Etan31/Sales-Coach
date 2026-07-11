import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import * as statisticsController from '../controllers/statisticsController.js';

const router = Router();

router.get('/', requireAuth, statisticsController.get);

export default router;
