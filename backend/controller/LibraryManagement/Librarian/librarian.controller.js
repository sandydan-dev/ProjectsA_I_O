const {
  LibrarianModel,
  UserModel,
  LibraryBranchModel,
} = require("../../../model/index");

// generate random id for librarian
function generateLibrarianId() {
  const prefix = "LB";
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `#{prifix}${randomNumber}`;
}

const createLibrarianProfile = async (req, res) => {
  try {
    const { userId, branchId, name, email, age, mobile, address, role } =
      req.body;

    // Multer photo
    const photo = req.file ? req.file.filename : null;

    // check role : only admin/superamin can create librarian profile
    if (!["admin", "superadmin"].includes(req.user?.role)) {
      return res.status(403).json({
        status: false,
        message:
          "Access denined. only admin/superadmin can create this profile.",
      });
    }

    const user = await UserModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "user not found.",
      });
    }

    // check if branch exist
    const branch = await LibraryBranchModel.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({
        status: false,
        message: "Branch not found.",
      });
    }

    // generate librarian id
    const librarianId = generateLibrarianId();

    // Create librarian profile
    const librarian = await LibrarianModel.create({
      librarianId,
      userId,
      branchId,
      name,
      email,
      age,
      mobile,
      address,
      photo,
      role: role || "librarian",
      createdBy: req.user.id, // Admin who created
    });

    // Send message/email (example console log)
    console.log(
      `📩 Librarian ${name} profile created. Assigned to branch ${branch.name}`
    );

    return res.status(201).json({
      status: true,
      message: "Librarian profile created successfully",
      data: librarian,
    });
  } catch (error) {
    console.error("Error creating librarian:", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error });
  }
};

// GET all librarians
const getAllLibrarians = async (req, res) => {
  try {
    // role check
    const allowedRoles = ["admin", "superadmin", "librarian"];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: not authorized" });
    }

    // Fetch librarians with associations
    const librarians = await LibrarianModel.findAll({
      include: [
        {
          model: UserModel,
          attributes: ["id", "username", "email", "role"],
        },
        {
          model: LibraryBranchModel,
          attributes: ["id", "branchName", "location"],
        },
        {
          model: UserModel,
          as: "AssignedBy",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: librarians.length,
      data: librarians,
    });
  } catch (error) {
    console.error("❌ Error fetching librarians:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateLibrarian = async (req, res) => {
  try {
    const { id } = req.params; // librarianid from url
    const updates = req.body;

    const allowedRoles = ["admin", "superadmin", "librarian"];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(404).json({
        status: false,
        message: "Access denied: not authorized",
      });
    }

    // Find librarian
    const librarian = await LibrarianModel.findByPk(id);
    if (!librarian) {
      return res.status(404).json({ message: "Librarian not found" });
    }

    // Role-based check
    if (req.user.role === "librarian" && req.user.id !== librarian.userId) {
      return res
        .status(403)
        .json({ message: "Access denied: cannot update other librarians" });
    }

    // Update librarian
    await librarian.update(updates);

    res.status(200).json({
      success: true,
      message: "Librarian updated successfully",
      data: librarian,
    });
  } catch (error) {
    console.error("❌ Error updating librarian:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Allowed roles
const allowedRoles = ["admin", "superadmin", "librarian"];

// Get Librarian by ID
const getLibrarianById = async (req, res) => {
  try {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const librarian = await LibrarianModel.findByPk(id);

    if (!librarian) {
      return res.status(404).json({ message: "Librarian not found" });
    }

    res.status(200).json({ success: true, data: librarian });
  } catch (error) {
    console.error("❌ Error fetching librarian by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Librarian by Name
const getLibrarianByName = async (req, res) => {
  try {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name } = req.params;
    const librarians = await LibrarianModel.findAll({ where: { name } });

    if (!librarians.length) {
      return res
        .status(404)
        .json({ message: "No librarian found with this name" });
    }

    res.status(200).json({ success: true, data: librarians });
  } catch (error) {
    console.error("❌ Error fetching librarian by name:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Get Librarian by LibrarianId
const getLibrarianByLibrarianId = async (req, res) => {
  try {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { librarianId } = req.params;
    const librarian = await LibrarianModel.findOne({ where: { librarianId } });

    if (!librarian) {
      return res
        .status(404)
        .json({ message: "Librarian not found with this librarianId" });
    }

    res.status(200).json({ success: true, data: librarian });
  } catch (error) {
    console.error("❌ Error fetching librarian by librarianId:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 4. Get Librarian by Email
const getLibrarianByEmail = async (req, res) => {
  try {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { email } = req.params;
    const librarian = await LibrarianModel.findOne({ where: { email } });

    if (!librarian) {
      return res
        .status(404)
        .json({ message: "Librarian not found with this email" });
    }

    res.status(200).json({ success: true, data: librarian });
  } catch (error) {
    console.error("❌ Error fetching librarian by email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLibrarianProfile,
  getAllLibrarians,
  updateLibrarian,
  //
  getLibrarianById,
  getLibrarianByName,
  getLibrarianByLibrarianId,
  getLibrarianByEmail,
};
