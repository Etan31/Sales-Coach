import asyncHandler from '../utils/asyncHandler.js';
import * as configService from '../services/configService.js';

export const get = asyncHandler(async (req, res) => {
  res.json(configService.getConfig());
});
