const { UserModel, LibraryBranchModel } = require("../../../model/index");

const createBranch = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      contactNumber,
      email,
      status,
      branchType,
      managementMode,
    } = req.body;

    const userId = req.user; // from auth middleware
    // const createdBy = req.user?.name;
    const logoUrl = req.file?.path || null;

    // check role only admin/superadmin/librarian have access to create this
    if (!["admin", "superadmin", "librarian"].includes(userId.role)) {
      return res.status(403).json({
        status: false,
        message: `Access denined. Only admin, superadmin, librarian can create branch.`,
      });
    }

    // library name and contanctnumber status is mandatory
    if (!name || !contactNumber) {
      return res.status(404).json({
        status: false,
        message: "Branch name and contact number are required.",
      });
    }
    // auto generate branch code (e.g., "BR01", "BR02", etc.)
    const totalBranches = await LibraryBranchModel.count();
    console.log("total branches:", totalBranches);

    // branch code
    const branchCode = `BR${(totalBranches + 1).toString().padStart(2, "0")}`;
    console.log("branch code: ", branchCode);

    // opening hours gives default list
    // ✅ Default opening hours
    const defaultHours = {
      Monday: "09:00–17:00",
      Tuesday: "09:00–17:00",
      Wednesday: "09:00–17:00",
      Thursday: "09:00–17:00",
      Friday: "09:00–17:00",
      Saturday: "10:00–14:00",
      Sunday: "Closed",
    };

    // ✅ Create branch
    const newBranch = await LibraryBranchModel.create({
      branchCode,
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      contactNumber,
      email,
      status: status || "active",
      branchType: branchType || "physical",
      managementMode: managementMode || "digital",
      openingHours: defaultHours,
      logoUrl,
      createdBy: userId.id,
      updatedBy: userId.id,
    });

    console.log("New branch created", newBranch);
    return res.status(201).json({
      status: true,
      message: "Library branch created successfully.",
      data: newBranch,
    });
  } catch (error) {
    console.error("Branch creation error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error while creating branch.",
    });
  }
};

// get all library branchese
const getAllBranches = async (req, res) => {
  try {
    const userRole = req.user?.role || "regular"; // fallback if unauthenticated
    // Define public fields
    const publicFields = [
      "description",
      "address",
      "city",
      "state",
      "country",
      "postalCode",
      "contactNumber",
      "email",
      "status",
      "branchType",
      "managementMode",
      "openingHours",
      "name",
      "branchCode",
      "logoUrl",
    ];

    // Define full fields for privileged roles
    const fullFields = [
      "id",
      "description",
      "address",
      "city",
      "state",
      "country",
      "postalCode",
      "contactNumber",
      "email",
      "status",
      "branchType",
      "managementMode",
      "openingHours",
      "name",
      "branchCode",
      "logoUrl",
      "createdBy",
      "updatedBy",
      "createdAt",
      "updatedAt",
    ];

    // only main roles can see all details
    const isPrivileged = ["admin", "superadmin", "librarian"].includes(
      userRole
    );

    // SEE FIELDS FOR MAIN ROLE / NORMAL ROLE
    const branch = await LibraryBranchModel.findAll({
      attributes: isPrivileged ? fullFields : publicFields,
      order: [["createdAt", "DESC"]],
    });

    if (!branch || branch.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No branch data found" });
    }

    console.log("All branchese:", branch);
    return res.status(200).json({ status: true, data: branch });
  } catch (error) {
    console.error("Error fetching branches:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      status: false,
      message: "Error while getting all branch data",
      error,
    });
  }
};

// update branch
const updateLibraryBranch = async (req, res) => {
  try {
    // only this role can update library details
    const allowedRoles = ["admin", "superadmin", "librarian"];
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: false,
        message: "You do not have permission to update library branches",
      });
    }

    const branchId = req.params.id;

    const {
      description,
      address,
      city,
      state,
      country,
      postalCode,
      contactNumber,
      email,
      status,
      branchType,
      managementMode,
      openingHours,
      name,
      branchCode,
      logoUrl,
    } = req.body;

    const updatedBy = req.user?.id;

    const branch = await LibraryBranch.findByPk(branchId);

    if (!branch) {
      return res
        .status(404)
        .json({ status: false, message: "Branch not found" });
    }

    await branch.update({
      description,
      address,
      city,
      state,
      country,
      postalCode,
      contactNumber,
      email,
      status,
      branchType,
      managementMode,
      openingHours,
      name,
      branchCode,
      logoUrl,
      updatedBy,
    });

    return res.status(200).json({
      status: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    console.error("Error updating branch:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error, while updating",
      error: error.message,
    });
  }
};

// delete branch
const deleteLibraryBranch = async (req, res) => {
  try {
    const allowedRoles = ["admin", "superadmin", "librarian"];
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: false,
        message: "You do not have permission to delete library branches",
      });
    }

    const branchId = req.params.id;

    const branch = await LibraryBranch.findByPk(branchId);

    if (!branch) {
      return res.status(404).json({
        status: false,
        message: "Branch not found",
      });
    }

    await branch.destroy();
    return res.status(200).json({
      status: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error, deleting library",
      error: error.message,
    });
  }
};

module.exports = {
  createBranch,
  getAllBranches,
  updateLibraryBranch,
  deleteLibraryBranch
};
