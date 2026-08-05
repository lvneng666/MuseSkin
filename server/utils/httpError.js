/** Create an Error that the central error handler turns into a JSON response. */
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.expose = true;
  return err;
}
