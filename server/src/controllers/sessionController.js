import asyncHandler from '../utils/asyncHandler.js';
import * as sessionService from '../services/sessionService.js';

export const create = asyncHandler(async (req, res) => {
  const session = await sessionService.createSession(req.supabase, req.user.id, req.body);
  res.status(201).json({ session });
});

export const getById = asyncHandler(async (req, res) => {
  const detail = await sessionService.getSessionDetail(req.supabase, req.params.id);
  res.json(detail);
});

export const history = asyncHandler(async (req, res) => {
  const result = await sessionService.listHistory(req.supabase, req.query);
  res.json(result);
});
