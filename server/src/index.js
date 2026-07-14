import app from "./app.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";
import { startServer } from "./utils/startServer.js";

const host = process.env.API_HOST || "0.0.0.0";

startServer(app, config.port, host)
  .then(({ port }) => {
    logger.info(`API on http://localhost:${port}`);
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
