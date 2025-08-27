const express = require("express");
const userRouter = express.Router();

const { verifyToken } = require("../../middleware/handleToken.token");
const { upload } = require("../../middleware/multerHandler.js");
const { authorizeRoles } = require("../../middleware/authorizeRoles.js");

const uploadSingle = upload.single("profilePhoto");
const uploadMultiple = upload.any();

const { userController } = require("../../controller/index.js");

// only admin/superadmin can create privileged user or another create role for admin / superadmin
userRouter.post(
  "/register-privileged",
  uploadSingle,
  userController.userRegister
);

// Public registration for employees
userRouter.post("/register", uploadSingle, userController.userRegister);

// email verification
userRouter.get("/verify-email", userController.verifyEmail);

// user login route
userRouter.post("/login", userController.loginUser);

// user logout
userRouter.get("/logout", userController.logoutUser);

// soft delete route
userRouter.patch(
  "/soft-delete/:id",
  verifyToken,
  authorizeRoles(
    "admin",
    "superadmin",
    "manager",
    "staff",
    "employee",
    "regular",
    "student"
  ),
  userController.softDeleteUser
);

// hard delete route
userRouter.delete(
  "/hard-delete/:id",
  verifyToken,
  authorizeRoles(
    "admin",
    "superadmin",
    "manager",
    "staff",
    "employee",
    "regular",
    "student"
  ),
  userController.hardDeleteUser
);

// get all active user route
userRouter.get(
  "/active-users",
  verifyToken,
  authorizeRoles(
    "admin",
    "superadmin",
    "manager",
    "staff",
    "employee",
    "regular",
    "student"
  ),
  userController.getAllActiveUsers
);

// get all In active user route
userRouter.get(
  "/inactive-users",
  verifyToken,
  authorizeRoles(
    "admin",
    "superadmin",
    "manager",
    "staff",
    "employee",
    "regular",
    "student"
  ),
  userController.getInActiveUsers
);

// make active user route
userRouter.patch(
  "/make-active/:id",
  verifyToken,
  authorizeRoles(
    "admin",
    "superadmin",
    "manager",
    "staff",
    "employee",
    "regular",
    "student"
  ),

  userController.makeActiveUser
);

// update user details
userRouter.patch(
  "/update/:id",
  verifyToken,
  authorizeRoles(
    "admin",
    "superadmin",
    "manager",
    "staff",
    "employee",
    "regular",
    "student"
  ),
  uploadSingle,
  userController.updateUser
);

// banned user by only admin/superadmin
userRouter.put(
  "/ban/:userId",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  userController.banUser
);

userRouter.put(
  "/unban/:userId",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  userController.banUser
);
// suspend user
userRouter.put(
  "/suspend/:userId",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  userController.suspendUser
);

userRouter.put(
  "/unsuspend/:userId",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  userController.unsuspendUser
);

module.exports = userRouter;
