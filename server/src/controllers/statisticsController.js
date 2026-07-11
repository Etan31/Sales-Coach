import asyncHandler from '../utils/asyncHandler.js';
import * as statisticsService from '../services/statisticsService.js';

export const get = asyncHandler(async (req, res) => {
  const stats = await statisticsService.getStatistics(req.supabase);
  res.json(stats);
});
