import asyncHandler from '../utils/asyncHandler.js';
import * as chatService from '../services/chatService.js';

export const postMessage = asyncHandler(async (req, res) => {
  const message = await chatService.postMessage(req.supabase, req.body);
  res.status(200).json({ message });
});
