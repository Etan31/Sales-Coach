import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';
import * as evaluationController from '../controllers/evaluationController.js';
import { endSessionSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', requireAuth, aiRateLimiter, validate(endSessionSchema), evaluationController.endSession);

export default router;
