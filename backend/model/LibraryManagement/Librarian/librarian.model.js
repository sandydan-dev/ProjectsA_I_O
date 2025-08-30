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
      references: { model: "library_branches", key: "id" }, // FK → LibraryBranch
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
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
  // Link to the user account (librarian identity)
  Librarian.belongsTo(models.UserModel, {
    foreignKey: "userId",
  });

  // Link to the library branch
  Librarian.belongsTo(models.LibraryBranchModel, {
    foreignKey: "branchId",
  });

  // Track which admin assigned this librarian
  Librarian.belongsTo(models.UserModel, {
    foreignKey: "createdBy",
    as: "AssignedBy",
  });

  // Reverse associations
  models.UserModel.hasOne(models.LibrarianModel, {
    foreignKey: "userId",
  });

  models.UserModel.hasMany(models.LibrarianModel, {
    foreignKey: "createdBy",
    as: "AssignedLibrarians",
  });

  models.LibraryBranchModel.hasMany(models.LibrarianModel, {
    foreignKey: "branchId",
  });
};

module.exports = Librarian;
