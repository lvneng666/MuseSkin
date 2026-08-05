/** Loads the session user into req.user if present; never rejects. */
export function optionalAuth(req, _res, next) {
  if (req.session?.user) req.user = req.session.user;
  next();
}

/** Requires a logged-in user. */
export function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Authentication required' });
  req.user = req.session.user;
  next();
}

/** Requires a logged-in admin. */
export function requireAdmin(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  req.user = req.session.user;
  next();
}
