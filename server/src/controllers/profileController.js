import asyncHandler from '../utils/asyncHandler.js';
import * as profileRepository from '../repositories/profileRepository.js';
import { NotFoundError } from '../utils/errors.js';

export const get = asyncHandler(async (req, res) => {
  const row = await profileRepository.getProfile(req.supabase, req.user.id);
  if (!row) throw new NotFoundError('Profile not found');

  res.json({
    profile: {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      createdAt: row.created_at
    }
  });
});
