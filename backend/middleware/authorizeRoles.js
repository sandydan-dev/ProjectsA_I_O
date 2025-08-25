const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; // check role from request

    // if no user role found
    if (!user || !user.role) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized : No user role found.",
      });
    }

    // access roles
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: false,
        messagge: `Not allowed/access : ${user.role} does not have access.`,
      });
    }

    // if role found then push to next
    next();
  };
};

module.exports = {
  authorizeRoles,
};
