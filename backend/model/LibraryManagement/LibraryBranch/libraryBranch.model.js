const { sequelize } = require("../../../config/dataConnection");
const { DataTypes } = require("sequelize");

const LibraryBranch = sequelize.define(
  "LibraryBranch",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // library branch code
    branchCode: {
      type: DataTypes.STRING(4),
      allowNull: false,
      unique: true,
    },

    // library name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
    },

    city: {
      type: DataTypes.STRING,
    },

    state: {
      type: DataTypes.STRING,
    },

    country: {
      type: DataTypes.STRING,
    },
    postalCode: {
      type: DataTypes.STRING,
    },
    contactNumber: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
    },
    openingHours: {
      type: DataTypes.JSON, // flexible for storing schedules
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "archived"),
      defaultValue: "active",
    },
    // what kind of branch physical or digital
    branchType: {
      type: DataTypes.ENUM("physical", "digital", "mobile"),
      defaultValue: "physical",
    },

    // manage by application, so it is digital
    managementMode: {
      type: DataTypes.ENUM("manual", "digital", "hybrid"),
      defaultValue: "digital", // because you're using an app to manage it
    },

    createdBy: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }, // FK → User (Admin/SuperAdmin)
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" },
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "library_branches",
  }
);

// Associations
LibraryBranch.associate = (models) => {
  // branch has many librarian
  LibraryBranch.hasMany(models.Librarian, {
    foreignKey: "branchId",
  });

  // branch has many shelf
  LibraryBranch.hasMany(models.Shelf, {
    foreignKey: "branchId",
  });

  // branch has many inventories
  LibraryBranch.hasMany(models.BookInventory, {
    foreignKey: "branchId",
  });

  LibraryBranch.belongsTo(models.User, {
    foreignKey: "createdBy",
  });
  LibraryBranch.belongsTo(models.User, { foreignKey: "createdBy" });
};

module.exports = LibraryBranch;
