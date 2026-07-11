import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

// Throttles the AI-backed endpoints (/api/chat, /api/end-session).
export const aiRateLimiter = rateLimit({
  windowMs: config.aiRateLimit.windowMs,
  max: config.aiRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later',
      status: 429,
      timestamp: new Date().toISOString()
    });
  }
});
