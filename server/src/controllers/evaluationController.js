import asyncHandler from '../utils/asyncHandler.js';
import * as evaluationService from '../services/evaluationService.js';

export const endSession = asyncHandler(async (req, res) => {
  const evaluation = await evaluationService.endSession(req.supabase, req.body.sessionId);
  res.status(200).json({ evaluation });
});
