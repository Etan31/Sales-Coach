import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import * as sessionController from '../controllers/sessionController.js';
import { historyQuerySchema } from '../validators/schemas.js';

const router = Router();

router.get('/', requireAuth, validate(historyQuerySchema, 'query'), sessionController.history);

export default router;
