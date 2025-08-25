const express = require("express");
const taskRouter = express.Router();

const { taskController } = require("../../controller/index"); // controller
const { verifyToken } = require("../../middleware/handleToken.token"); // token
const { authorizeRoles } = require("../../middleware/authorizeRoles"); // role
const { upload } = require("../../middleware/multerHandler.js"); // upload image/files

const uploadSingle = upload.single("profilePhoto");
const uploadMultiple = upload.any();

taskRouter.post(
  "/",
  verifyToken,
  uploadMultiple,
  authorizeRoles(
    "admin",
    "superadmin",
    "manager",
    "staff",
    "employee",
    "regular",
    "student"
  ),
  taskController.createTask
);

taskRouter.get(
  "/",
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
  taskController.getAllTask
);

taskRouter.get(
  "/:id",
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
  taskController.getTaskById
);

taskRouter.get(
  "/status/:status",
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
  taskController.getTasksByStatus
);

taskRouter.get(
  "/priority/:priority",
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
  taskController.getTasksByPriority
);

taskRouter.patch(
  "/archive/:id",
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
  taskController.achieveTask
);

taskRouter.put(
  "/:id",
  verifyToken,
  uploadMultiple,
  authorizeRoles(
    "admin",
    "superadmin",
    "manager",
    "staff",
    "employee",
    "regular",
    "student"
  ),
  taskController.updateTask
);

// DELETE route
taskRouter.delete(
  "/:id",
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
  taskController.deleteTask
);

module.exports = taskRouter;
