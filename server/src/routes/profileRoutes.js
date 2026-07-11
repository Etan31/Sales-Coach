import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import * as profileController from '../controllers/profileController.js';

const router = Router();

router.get('/', requireAuth, profileController.get);

export default router;
