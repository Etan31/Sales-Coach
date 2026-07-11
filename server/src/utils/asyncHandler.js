// Wraps an async route/middleware handler so rejected promises reach the error handler.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
