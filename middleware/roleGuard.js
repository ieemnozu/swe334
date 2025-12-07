function requireRoles(...allowed) {
  return function (req, res, next) {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    const userRole = req.user.role;
    const has = allowed.some((r) => r == userRole);
    if (!has)
      return res.status(403).json({ message: "Эрх хүрэлцэхгүй байна" });

    next();
  };
}

module.exports = { requireRoles };