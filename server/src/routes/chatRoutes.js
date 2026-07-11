import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';
import * as chatController from '../controllers/chatController.js';
import { chatSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', requireAuth, aiRateLimiter, validate(chatSchema), chatController.postMessage);

export default router;
