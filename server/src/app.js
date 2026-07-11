import express from 'express';
import pinoHttp from 'pino-http';
import logger from './utils/logger.js';
import { applySecurity } from './middleware/security.js';
import routes from './routes/index.js';
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

applySecurity(app);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
