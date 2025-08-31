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
    // short description of library
    description: {
      type: DataTypes.TEXT, // Short summary for UI display
      allowNull: true,
    },
    // library address
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // city of library branch
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // location state of library
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // country of library situated
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // postal code 
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // library contact number
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // library email
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // library working days
    openingHours: {
      type: DataTypes.JSON,
      allowNull: true, // flexible for storing schedules
    },
    // status of library
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
    // library images
    logoUrl: {
      type: DataTypes.STRING, // Branch logo or image
      allowNull: true,
    },
    // who created the library
    createdBy: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }, // FK → User (Admin/SuperAdmin)
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: true,
    },
    // who updated the library
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

  // library has many librarian user
  LibraryBranch.belongsTo(models.User, {
    foreignKey: "createdBy",
  });

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

};

module.exports = LibraryBranch;
