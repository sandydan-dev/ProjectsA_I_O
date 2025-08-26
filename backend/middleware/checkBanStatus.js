function checkBanStatus(req, res, next) {
  const user = req.user; // assumes user is authenticated and attached to req

  if (!user) {
    return res.status(401).json({ error: "Unauthorized: No user found" });
  }

  if (user.isBanned) {
    return res.status(403).json({
      error: "Access denied. Your account is banned.",
      reason: user.banReason || "No reason provided",
      bannedAt: user.bannedAt || null,
      bannedBy: user.bannedBy || null,
      // banExpiresAt is ignored here, handle it manually in the controller
    });
  }

  next(); // user is not banned, continue
}

module.exports = checkBanStatus;
