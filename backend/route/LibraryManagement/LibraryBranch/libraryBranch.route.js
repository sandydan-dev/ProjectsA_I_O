const express = require("express");
const branchRouter = express.Router();

const { verifyToken } = require("../../../middleware/handleToken.token.js");
const { upload } = require("../../../middleware/multerHandler.js");
const { authorizeRoles } = require("../../../middleware/authorizeRoles.js");

const uploadSingle = upload.single("logo");
const uploadMultiple = upload.any();

const { branchController } = require("../../../controller/index.js");

// post / create new branch
//* API: localhost:3000/api/branch
branchRouter.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian", "assistant"),
  uploadSingle,
  branchController.createBranch
);

module.exports = branchRouter;
