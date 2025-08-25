const jwt = require("jsonwebtoken");
const { Model } = require("sequelize");
require("dotenv").config();

const generateToken = (user) => {
  try {
    if (!user) {
      throw new Error("User ID is requried to generate token.");
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error("JWT key is not defined in evironment.");
    }

    // const token = jwt.sign(
    //   { userId: user.id, role: user.role, email: user.email },
    //   secretKey,
    //   { expiresIn: "1y" }
    // );

    const token = jwt.sign(
    {
      id: user.id,
      name : user.name,
      role: user.role,
      email: user.email,
      privilegedId: user.privilegedId || null,
      createdBy: user.createdBy || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1y" }
  );

    return token;
  } catch (error) {
    console.log("Token Generation Failed", error.message);
    throw new Error("Internal Token Generation Error.");
  }
};

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // check if header exists and start with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: false, message: "Authorization token is missing." });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
      throw new Error("JWT key is not configured.");
    }

    // verify token
    const decoded = jwt.verify(token, secretKey);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
      privilegedId: decoded.privilegedId || null,
      createdBy: decoded.createdBy || null,
    };
    console.log("Decoded JWT:", decoded);


    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(403).json({
      status: false,
      message: "Invalid or unauthorized token",
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
