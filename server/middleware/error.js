export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const isMulter = !!err.code && String(err.code).startsWith('LIMIT_');
  const status = err.status || err.statusCode || (isMulter ? 400 : 500);
  const message = err.expose || isMulter ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
}
