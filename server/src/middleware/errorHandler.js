import config from '../config/index.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/errors.js';

function buildEnvelope(status, message) {
  return { error: message, status, timestamp: new Date().toISOString() };
}

// Central error handler; must be registered last, after all routes.
export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err instanceof ApiError ? err.status : 500;
  const isServerError = status >= 500;

  logger.error({ err, status, path: req.originalUrl }, err.message);

  // TEMP: production redaction disabled for deploy debugging - revert once the 500 is fixed.
  const message = err.message;

  res.status(status).json(buildEnvelope(status, message));
}

// Catches requests that matched no route.
export function notFoundHandler(req, res) {
  res.status(404).json(buildEnvelope(404, 'Not found'));
}
