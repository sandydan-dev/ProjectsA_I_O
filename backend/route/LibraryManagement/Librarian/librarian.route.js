const express = require("express");
const librarianRouter = express.Router();

const { verifyToken } = require("../../../middleware/handleToken.token.js");
const { upload } = require("../../../middleware/multerHandler.js");
const { authorizeRoles } = require("../../../middleware/authorizeRoles.js");

const uploadSingle = upload.single("profilePhoto");
const uploadMultiple = upload.any();

const {
  createLibrarianProfileController,
} = require("../../../controller/index");

// create librarian profile
librarianRouter.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  uploadSingle,
  createLibrarianProfileController.createLibrarianProfile
);

librarianRouter.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  createLibrarianProfileController.getAllLibrarians
);

// update librarian
librarianRouter.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  uploadSingle,
  createLibrarianProfileController.updateLibrarian
);

// GET by ID
librarianRouter.get(
  "/id/:id",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  createLibrarianProfileController.getLibrarianById
);

// GET by Name
librarianRouter.get(
  "/name/:name",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  createLibrarianProfileController.getLibrarianByName
);

// GET by LibrarianId
librarianRouter.get(
  "/librarianId/:librarianId",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  createLibrarianProfileController.getLibrarianByLibrarianId
);

// GET by Email
librarianRouter.get(
  "/email/:email",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  createLibrarianProfileController.getLibrarianByEmail
);

module.exports = librarianRouter;
