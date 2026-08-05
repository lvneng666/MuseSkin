/**
 * Express middleware that validates req.body against a zod schema and
 * replaces req.body with the parsed (coerced) result. 400 on failure.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues[0]?.message || 'Invalid request body';
    return res.status(400).json({ error: message });
  }
  req.body = result.data;
  next();
};
