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

    createdBy: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }, // FK → User (Admin/SuperAdmin)
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: false,
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
    // onDelete: "CASCADE",
    // onUpdate: "CASCADE",
  });

  // branch has many shelf
  LibraryBranch.hasMany(models.Shelf, {
    foreignKey: "branchId",
    // onDelete: "CASCADE",
    // onUpdate: "CASCADE",
  });

  // branch has many inventories
  LibraryBranch.hasMany(models.BookInventory, {
    foreignKey: "branchId",
    // onDelete: "CASCADE",
    // onUpdate: "CASCADE",
  });
  LibraryBranch.belongsTo(models.User, { foreignKey: "createdBy" });
};

module.exports = LibraryBranch;
