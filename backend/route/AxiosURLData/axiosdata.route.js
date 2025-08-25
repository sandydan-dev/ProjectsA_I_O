const express = require("express");
const dataRouter = express.Router();

const { verifyToken } = require("../../middleware/handleToken.token");
const { authorizeRoles } = require("../../middleware/authorizeRoles");

const { dataController } = require("../../controller/index");

dataRouter.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "superadmin", "manager", "staff", "employee"),
  dataController.getURLData
);

module.exports = dataRouter;
