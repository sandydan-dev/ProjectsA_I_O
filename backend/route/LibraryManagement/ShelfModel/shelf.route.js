const express = require("express");
const shelfRouter = express.Router();

const { shelfController } = require("../../../controller/index");
const { verifyToken } = require("../../../middleware/handleToken.token.js");

// ✅ Route to create a new shelf (only for admin/superadmin/librarian)
shelfRouter.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  shelfController.createShelf
);

module.exports = shelfRouter;
