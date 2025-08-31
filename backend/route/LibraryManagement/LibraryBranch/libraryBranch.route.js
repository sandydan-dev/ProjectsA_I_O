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
// dummy data
// {
//   logo = "library_logo.png",
//   name = "Central Library",
//   description = "Main branch near city center",
//   address = "MG Road, Nagpur",
//   city = "Nagpur",
//   state = "Maharashtra",
//   country = "India",
//   postalCode = "443221",
//   contactNumber = "9876543210",
//   email = "central@library.com",
//   status = "active",
//   branchType = "physical",
//   managementMode = "digital"

// }
branchRouter.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian"),
  uploadSingle,
  branchController.createBranch
);

//* API: localhost:3000/api/branch
branchRouter.get(
  "/",
  verifyToken,
  authorizeRoles(
    "admin",
    "superadmin",
    "librarian",
    "assistant",
    "regular",
    "staff",
    "manager"
  ),
  branchController.getAllBranches
);

//API : localhost:3000/api/branch/update/4
// update branch
// dummy data
// {
//   logo = "library_logo.png",
//   name = "Central Library",
//   description = "Main branch near city center",
//   address = "MG Road, Nagpur",
//   city = "Nagpur",
//   state = "Maharashtra",
//   country = "India",
//   postalCode = "443221",
//   contactNumber = "9876543210",
//   email = "central@library.com",
//   status = "active",
//   branchType = "physical",
//   managementMode = "digital"

// }
branchRouter.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian", "assistant"),
  uploadSingle,
  branchController.updateLibraryBranch
);

//API : localhost:3000/api/branch/1
branchRouter.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian", "assistant"),
  branchController.getLibraryBranchById
);

// delete branch
branchRouter.delete(
  "/branche/:id",
  verifyToken,
  authorizeRoles("admin", "superadmin", "librarian", "assistant"),
  branchController.deleteLibraryBranch
);

module.exports = branchRouter;
