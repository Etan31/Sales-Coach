import { Router } from 'express';

const router = Router();

// GET /api/health - liveness check, no auth required.
router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
