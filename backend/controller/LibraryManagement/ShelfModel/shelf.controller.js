const {
  ShelfModel,
  LibraryBranchModel,
  CategoryModel,
} = require("../../../model/index");

const QRCode = require("qrcode");

const allowedRoles = ["admin", "superadmin", "librarian"];

const createShelf = async (req, res) => {
  try {
    // extract data from body
    let { branchId, floor, section, row, capacity, categoryId } = req.body;

    console.log("📥 Incoming Shelf Data:", req.body); // Debug log
    console.log("👤 User Role:", req.user?.role);

    // only role can create (allowRoles)
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.warn("🚫 Unauthorized attempt to create shelf:", req.user);

      return res.status(403).json({
        success: false,
        message:
          "Forbidden: only admin, superadmin, or librarian can create shelves",
      });
    }

    // Normalize strings (avoid invisible duplicates like "Row A " vs "Row A")
    floor = typeof floor === "string" ? floor.trim() : floor;
    section = typeof section === "string" ? section.trim() : section;
    row = typeof row === "string" ? row.trim() : row;

    // Generate shelfLabel from coordinates
    const shelfLabel = `F${floor || "X"}-S${section || "X"}-R${row || "X"}`;

    console.log("🏷️ Generated Shelf Label:", shelfLabel);

    // Validate required fields
    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "branchId is required",
      });
    }

    // ensure the branch exist
    const branch = await LibraryBranchModel.findByPk(branchId);
    if (!branch) {
      console.warn("❌ Branch not found for branchId:", branchId);
      return res.status(404).json({
        success: false,
        message: "Library branch not found",
      });
    }

    // Category existence (optional)
    if (categoryId) {
      const category = await CategoryModel.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Duplicate shelf check within same branch
    const duplicate = await ShelfModel.findOne({
      where: {
        branchId,
        floor: floor ?? null,
        section: section ?? null,
        row: row ?? null,
        shelfLabel,
      },
    });

    if (duplicate) {
      console.warn("⚠️ Duplicate Shelf Found:", duplicate.dataValues);
      return res.status(409).json({
        success: false,
        message:
          "A shelf with the same coordinates already exists in this branch",
        data: duplicate,
      });
    }

    // Create shelf entry
    const shelf = await ShelfModel.create({
      branchId,
      floor: floor ?? null,
      section: section ?? null,
      row: row ?? null,
      capacity: capacity ?? 50, // default
      categoryId: categoryId ?? null,
      shelfLabel,
    });

    console.log("✅ Shelf Created:", shelf.dataValues);
    // Generate QR code with essential info
    const qrData = {
      shelfId: shelf.id,
      branchId,
      shelfLabel,
      locationCode: `${branchId}-${shelfLabel}`,
      capacity: shelf.capacity,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    console.log("qrCode data", qrCode);

    return res.status(201).json({
      success: true,
      message: "Shelf created successfully",
      data: {
        ...shelf.dataValues,
        qrCode,
      },
    });
  } catch (error) {
    // Granular error handling
    console.error("Error creating shelf:", error);

    // Sequelize validation errors (bad data types, etc.)
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors:
          error.errors?.map((e) => ({ field: e.path, message: e.message })) ??
          [],
      });
    }

    // Foreign key constraint (e.g., branchId doesn’t exist)
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Invalid foreign key: branchId",
        detail: error.parent?.message,
      });
    }

    // Fallback
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createShelf,
};
