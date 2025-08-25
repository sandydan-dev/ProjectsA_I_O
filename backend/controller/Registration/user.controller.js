const { UserModel } = require("../../model");
const bcrypt = require("bcrypt");

const { generateToken } = require("../../middleware/handleToken.token");

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

    // Check for existing user
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
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
    const user = await UserModel.create({
      name,
      email,
      mobile,
      password: hashPassword,
      profilePhoto,
      role: role || "regular", // fallback to employee if not provided
      privilegedId, // will be null for other roles
      createdBy: createdByData || { id: 0, name: "Self" }, // self-registration
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User creation failed" });
    }

    // If self-registration, update createdBy to self ID/name
    if (!createdByData) {
      user.createdBy = { id: user.id, name: user.name };
      await user.save();
    }

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: user,
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

const privilegedRoles = ["admin", "superadmin", "manager"];

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

    // Generate token
    // const token = generateToken({
    //   userId: user.id,
    //   role: user.role,
    //   email: user.email,
    //   privilegedId: user.privilegedId,
    //   createdBy: user.createdBy,
    // });
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
      createdBy : user.createdBy
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
    const { id } = req.params;
    const { name, email, mobile, password } = req.body;
    const user = await UserModel.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Active user not found or is deleted",
      });
    }

    // update fields
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

    await user.save();

    console.log("User updated", user);

    return res.status(201).json({
      status: true,
      message: "user update successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  userRegister,
  loginUser,
  logoutUser,
  softDeleteUser,
  hardDeleteUser,
  getAllActiveUsers,
  getInActiveUsers,
  makeActiveUser,
  updateUser,
};
