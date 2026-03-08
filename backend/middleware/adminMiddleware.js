const adminMiddleware = (req, res, next) => {
  // simple role check only; allow any user with admin role
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }

  // NOTE: the previous implementation required a hard‑coded email
  // (admin@sunelectronics.com) which prevented other admin accounts
  // from managing products.  The shop may have a different domain/name,
  // so we no longer restrict by email.  If needed this can be driven
  // from an environment variable or a database list of super‑admins.

  next();
};

module.exports = adminMiddleware;
