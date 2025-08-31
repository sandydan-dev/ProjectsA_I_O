const { UserModel } = require("../../model");
const bcrypt = require("bcrypt");
const sendEmail = require("../../utils/mailer");
const { generateToken } = require("../../middleware/handleToken.token");
require("dotenv").config();
const crypto = require("crypto");

const privilegedRoles = ["admin", "superadmin", "manager"];

const userRegister = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!name || !email || !password || !mobile) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    const profilePhoto = req.file ? req.file.path : null;
    // 1) Generate verification token + expiry (RAW token stored for simplicity)
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Check for existing user
    const user = await UserModel.findOne({ where: { email } });
    if (user) {
      return res
        .status(409)
        .json({ status: false, message: "Email already registered." });
    }

    // Hash password
    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);

    // Generate privilegedId only for admin, superadmin, manager
    let privilegedId = null;
    if (["admin", "superadmin", "manager"].includes(role)) {
      privilegedId = `PRIV${Math.floor(Math.random() * 100000)}`;
    }

    // Determine createdBy
    let createdByData = null;
    if (req.user) {
      // created by logged-in user (privileged registration)
      createdByData = { id: req.user.id, name: req.user.name };
    }

    // Create user
    const newUser = await UserModel.create({
      name,
      email,
      mobile,
      password: hashPassword,
      profilePhoto,
      role: role || "regular", // fallback to employee if not provided
      privilegedId, // will be null for other roles
      createdBy: createdByData || { id: 0, name: "Self" }, // self-registration
      emailVerificationToken,
      emailVerificationExpires,
    });

    // if (!newUser) {
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "User creation failed" });
    // }

    // If self-registration, update createdBy to self ID/name
    if (!createdByData) {
      newUser.createdBy = { id: newUser.id, name: newUser.name };
      await newUser.save();
    }

    // 6) Build verification URL and send email
    const base = (process.env.BASE_URL || "http://localhost:3000").replace(
      /\/+$/,
      ""
    );
    const verificationUrl = `${base}/api/user/verify-email?token=${emailVerificationToken}`;

    await sendEmail({
      to: email,
      subject: `📩 ${name} ➡ Verify your email`,
      text: `Hi ${name}, please verify your email using the link: ${verificationUrl}`,
      html: `
        <p>Hi ${name},</p>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}" style="padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
          Verify Email
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.status(201).json({
      status: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (
      error.name === "sequelizeDatabaseError" ||
      error.name === "SequelizeValidationError"
    ) {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }

    return res
      .status(500)
      .json({ status: false, message: "Failed to create user data" });
  }
};

// verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ status: false, message: "Veification token missing." });
    }

    // Look up by the same token we stored
    const user = await UserModel.findOne({
      where: { emailVerificationToken: token },
    });

    // if token expired or invalid
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Invalild or expired token",
      });
    }

    // if email verified already
    if (user.isEmailVerified) {
      return res.status(200).json({
        status: true,
        message: "Email already verified.",
      });
    }

    // verification token expired
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(410).json({
        status: false,
        message: "Verification token has expired",
      });
    }

    // mark email for verified
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Email Verified Successfully",
      verifiedAt: user.emailVerifiedAt,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      status: false,
      message: "Internal server error during email verification",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("email", email);
    console.log("email", password);

    // Find user by email
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found, please register first",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Incorrect password",
      });
    }

    // Check privileged roles
    if (privilegedRoles.includes(user.role) && !user.privilegedId) {
      return res.status(403).json({
        status: false,
        message: "Privileged user missing privileged ID",
      });
    }

    const token = generateToken(user);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    // Prepare response
    const responseData = {
      name: user.name,
      email: user.email,
      role: user.role,
      privilegedId: user.privilegedId,
      createdBy: user.createdBy,
    };

    // if privilegedId for main roles otherwise normal user login directly
    if (privilegedRoles.includes(user.role)) {
      responseData.privilegedId = user.privilegedId;
    }

    // Send response
    return res.status(200).json({
      status: true,
      message: "User logged in successfully",
      token,
      data: responseData,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      status: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// soft delete user
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findByPk(id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // only main role can perform soft delete
    const mainRoles = ["admin", "superadmin", "manager"];
    if (!mainRoles.includes(req.user.role)) {
      user.isDeleted = true;
      await user.save();
      return res.status(403).json({
        status: false,
        id,
        message: `User soft-deleted successfully by ${req.user.role}`,
      });
    }

    // only other roles can delete there own data
    if (req.user.id !== user.id) {
      return res.status(403).json({
        status: false,
        message: "You can only delete your own account",
      });
    }

    // mark Soft delete for self
    user.isDeleted = true;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "user soft delete successfully",
      id: id,
    });
  } catch (error) {
    console.error("Soft delete error:", error.message);
    return res.status(500).json({ status: false, message: "server error" });
  }
};

// permanent delete / hard delete from the database
const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findByPk(id);

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "user not found." });
    }

    const adminRoles = ["superadmin", "admin"];

    // Admin / Superadmin can delete anyone
    if (adminRoles.includes(req.user.role)) {
      await user.destroy();
      return res.status(200).json({
        status: true,
        message: "User hard-deleted successfully.",
      });
    }

    // Other roles can delete only themselves
    if (req.user.id !== user.id) {
      return res.status(403).json({
        status: false,
        message: "You can only delete your own account",
      });
    }

    // delete permanent // remove records
    await user.destroy();

    return res
      .status(200)
      .json({ status: true, message: "user hard delete successfully." });
  } catch (error) {
    console.error("Hard delete error:", error.message);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// get all active users
const getAllActiveUsers = async (req, res) => {
  try {
    const user = await UserModel.findAll({
      where: { isDeleted: false },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Users not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Active users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// get all soft deleted data
const getInActiveUsers = async (req, res) => {
  try {
    const user = await UserModel.findAll({
      where: { isDeleted: true },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "InActive users not found",
      });
    }

    return res
      .status(200)
      .json({ status: true, message: "In-Active users data" });
  } catch (error) {
    console.error("Get users error:", error.message);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

const makeActiveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findByPk(id);

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "In-Active user not found" });
    }

    const adminRoles = ["superadmin", "admin"];

    // Admin / Superadmin can activate any user
    if (!adminRoles.includes(req.user.role)) {
      // Other roles can activate only themselves
      if (req.user.id !== user.id) {
        return res.status(403).json({
          status: false,
          message: "You can only activate your own account",
        });
      }
    }

    // make it active / false
    user.isDeleted = false;
    await user.save();

    return res.status(200).json({ status: true, message: "User makes active" });
  } catch (error) {
    console.error("Get users error:", error.message);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// update user registration data
const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // user to update
    const {
      name,
      email,
      mobile,
      password,
      isBanned,
      banReason,
      isSuspended,
      suspendReason,
      suspendExpiresAt,
    } = req.body;

    console.log("UPDATE USER REQUEST:", {
      id,
      body: req.body,
      actor: req.user,
    });

    const user = await UserModel.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Active user not found or is deleted",
      });
    }

    const actorRole = req.user?.role;
    const actorId = req.user?.id;

    // ----- Role and Permission Checks -----

    // 1. If actor is a normal user and trying to update someone else
    if (
      actorRole !== "admin" &&
      actorRole !== "superadmin" &&
      actorId !== user.id
    ) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to update this user",
      });
    }

    // 2. If actor is the same user but is banned/suspended
    if (
      actorId === user.id &&
      (user.isBanned === true || user.isSuspended === true)
    ) {
      return res.status(403).json({
        status: false,
        message:
          "Your account is banned or suspended. Updates are not allowed.",
      });
    }

    // ----- Allowed Updates -----

    // Basic fields (self-update or admin update)
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (req.file) {
      user.profilePhoto = req.file.path;
    }

    // ----- Admin / Superadmin Special Fields -----
    if (actorRole === "admin" || actorRole === "superadmin") {
      if (typeof isBanned === "boolean") {
        user.isBanned = isBanned;
        user.banReason = isBanned ? banReason || "No reason provided" : null;
        user.bannedBy = isBanned
          ? { id: actorId, name: req.user.name || "Unknown" }
          : null;
        user.banDate = isBanned ? new Date() : null;
      }

      if (typeof isSuspended === "boolean") {
        user.isSuspended = isSuspended;
        user.suspendReason = isSuspended
          ? suspendReason || "No reason provided"
          : null;
        user.suspendedBy = isSuspended
          ? { id: actorId, name: req.user.name || "Unknown" }
          : null;
        user.suspendedAt = isSuspended ? new Date() : null;
        user.suspendExpiresAt =
          isSuspended && suspendExpiresAt ? new Date(suspendExpiresAt) : null;
      }
    }

    await user.save();

    console.log("User updated successfully:", user);

    return res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//todo: Ban a user
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    console.log("BAN USER REQUEST:", { userId, reason, actor: req.user });

    // only banned the user by admin/superadmin
    if (!["admin", "superadmin"].includes(req.user?.role)) {
      console.log(`Unauthorized role (${req.user?.role}) tried to ban user`);
      return res.status(403).json({
        status: false,
        message: "Not authorized to ban users",
      });
    }

    // find user from model
    const user = await UserModel.findByPk(userId);

    // if userid is not found
    if (!user) {
      console.log(`User id ${userId} not found`);
      return res.status(404).json({
        status: false,
        message: `User not found for this id ${userId}`,
      });
    }

    // update ban fields to ban a user
    user.isBanned = true;
    user.banReason = reason || `Violation spreading this user`;
    user.banDate = new Date();
    user.bannedBy = req.user.id;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Mr. ${req.user?.name} banned this user`,
      data: user,
    });
  } catch (error) {
    console.error("Error banning user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, while banned",
      error: error.message,
    });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("UNBAN USER REQUEST:", { userId, actor: req.user });

    // only admin/superadmin can handle this things
    if (!["admin", "superadmin"].includes(req.user?.role)) {
      console.warn(`Unauthorized role (${req.user?.role}) tried to unban user`);
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to unban users" });
    }

    const user = await UserModel.findByPk(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Clear ban fields
    user.isBanned = false;
    user.banReason = null;
    user.banDate = null;
    user.bannedBy = null;

    console.log(`User ${userId} unbanned by ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: "User unbanned successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error unbanning user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Utility to check if actor is allowed (admin/superadmin only)
const isAuthorized = (req) => ["admin", "superadmin"].includes(req.user?.role);

const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, expiresAt } = req.body;

    console.log("SUSPEND USER REQUEST:", {
      userId,
      reason,
      expiresAt,
      actor: req.user,
    });

    // Check permission
    if (!isAuthorized(req)) {
      console.warn(
        `Unauthorized role (${req.user?.role}) tried to suspend user`
      );
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to suspend users" });
    }

    const user = await UserModel.findByPk(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Apply suspension
    user.isSuspended = true;
    user.suspendReason = reason || "No reason provided";
    user.suspendedBy = { id: req.user.id, name: req.user.name || "Unknown" };
    user.suspendedAt = new Date();
    user.suspendExpiresAt = expiresAt ? new Date(expiresAt) : null;

    await user.save();

    console.log(`User ${userId} suspended by ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: `User suspended${
        expiresAt ? " until " + user.suspendExpiresAt.toISOString() : ""
      }`,
      data: user,
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("UNSUSPEND USER REQUEST:", { userId, actor: req.user });

    // Check permission
    if (!isAuthorized(req)) {
      console.warn(
        `Unauthorized role (${req.user?.role}) tried to unsuspend user`
      );
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to unsuspend users" });
    }

    const user = await UserModel.findByPk(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Clear suspension
    user.isSuspended = false;
    user.suspendReason = null;
    user.suspendedBy = null;
    user.suspendedAt = null;
    user.suspendExpiresAt = null;

    await user.save();

    console.log(`User ${userId} unsuspended by ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: "User unsuspended successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error unsuspending user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  userRegister,
  verifyEmail,
  loginUser,
  logoutUser,
  softDeleteUser,
  hardDeleteUser,
  getAllActiveUsers,
  getInActiveUsers,
  makeActiveUser,
  updateUser,
  // banned use
  banUser,
  unbanUser,
  // suspend user
  suspendUser,
  unsuspendUser,
};
