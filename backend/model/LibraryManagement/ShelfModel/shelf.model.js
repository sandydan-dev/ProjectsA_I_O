const { sequelize } = require("../../../config/dataConnection");
const { DataTypes } = require("sequelize");

const Shelf = sequelize.define(
  "Shelf",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: {
      type: DataTypes.INTEGER,
      references: { model: "library_branches", key: "id" },
      allowNull: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    floor: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    section: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    row: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    shelfLabel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "shelves",
  }
);

// Association/Relationship

Shelf.associate = (models) => {
  // Shelf belongs to a LibraryBranch
  Shelf.belongsTo(models.LibraryBranch, {
    foreignKey: "branchId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  models.LibraryBranch.hasMany(models.Shelf, { foreignKey: "branchId" });

  // shelf has many book inventory
  Shelf.hasMany(models.BookInventory, {
    foreignKey: "shelfId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
};

module.exports = Shelf;
