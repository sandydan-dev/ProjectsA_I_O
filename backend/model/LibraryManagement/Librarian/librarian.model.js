const { sequelize } = require("../../../config/dataConnection");
const { DataTypes } = require("sequelize");

const Librarian = sequelize.define(
  "Librarian",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    librarianId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }, // FK → User account
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: false,
    },
    branchId: {
      type: DataTypes.INTEGER,
      references: { model: "LibraryBranches", key: "id" }, // FK → LibraryBranch
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: { type: DataTypes.TEXT },

    photo: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM("librarian", "assistant"),
      defaultValue: "librarian",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }, // Admin who assigned
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    timestamps: true,
    tableName: "librarians",
  }
);

// Associations
Librarian.associate = (models) => {
  // Link librarian to User account
  Librarian.belongsTo(models.User, { foreignKey: "userId" });

  // Link librarian to assigned branch
  Librarian.belongsTo(models.LibraryBranch, { foreignKey: "branchId" });

  // librarian belongs to user
  Librarian.belongsTo(models.User, {
    foreignKey: "userId",
  });
  // Track which Admin assigned this librarian
  Librarian.belongsTo(models.User, {
    foreignKey: "createdBy",
    as: "AssignedBy",
  });

  // Reverse associations
  models.User.hasOne(Librarian, { foreignKey: "userId" });
  models.User.hasMany(Librarian, {
    foreignKey: "createdBy",
    as: "AssignedLibrarians",
  });

  models.LibraryBranch.hasMany(Librarian, { foreignKey: "branchId" });
};

module.exports = Librarian;
