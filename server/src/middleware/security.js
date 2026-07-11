import helmet from 'helmet';
import cors from 'cors';
import config from '../config/index.js';

// Applies security headers and CORS policy to the app; kept permissive since this is a JSON API.
export function applySecurity(app) {
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
}
