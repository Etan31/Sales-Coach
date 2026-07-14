export function startServer(
  app,
  requestedPort,
  host = "0.0.0.0",
  maxAttempts = 10,
) {
  return new Promise((resolve, reject) => {
    let attempt = 1;

    const tryListen = (port) => {
      const server = app.listen(port, host);

      server.once("listening", () => {
        resolve({ server, port });
      });

      server.once("error", (error) => {
        if (error.code === "EADDRINUSE" && attempt < maxAttempts) {
          attempt += 1;
          server.close(() => {
            tryListen(port + 1);
          });
          return;
        }

        reject(error);
      });
    };

    tryListen(requestedPort);
  });
}
