import { BadRequestError } from '../utils/errors.js';

// Validates req[source] against a Zod schema and replaces it with the parsed value.
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || source}: ${issue.message}`)
      .join('; ');
    return next(new BadRequestError(message || 'Invalid request'));
  }

  req[source] = result.data;
  next();
};

export default validate;
