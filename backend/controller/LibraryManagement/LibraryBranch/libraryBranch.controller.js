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

module.exports = {
  createBranch,
};
