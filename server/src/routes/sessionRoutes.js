import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import * as sessionController from '../controllers/sessionController.js';
import { createSessionSchema, sessionIdParamSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', requireAuth, validate(createSessionSchema), sessionController.create);
router.get('/:id', requireAuth, validate(sessionIdParamSchema, 'params'), sessionController.getById);

export default router;
