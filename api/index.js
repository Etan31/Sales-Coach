// Vercel serverless entry point.
// The Express app is itself a (req, res) handler, so we re-export it directly.
// All routes are mounted under /api inside the app, matching the vercel.json rewrite.
import app from '../server/src/app.js';

export default app;
