import pino from 'pino';

// Plain structured JSON logging; no extra transport dependency (e.g. pino-pretty) required.
const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});

export default logger;
