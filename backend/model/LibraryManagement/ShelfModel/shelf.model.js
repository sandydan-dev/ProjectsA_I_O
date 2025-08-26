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
    floor: { type: DataTypes.STRING },
    section: { type: DataTypes.STRING },
    row: { type: DataTypes.STRING },
    shelf: { type: DataTypes.STRING },
  },
  {
    timestamps: true,
    tableName: "shelfs",
  }
);

// Association/Relationship

Shelf.associate = (models) => {
  // shelf belongs to branch
  Shelf.belongsTo(models.LibraryBranch, {
    foreignKey: "branchId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  models.LibraryBranch.hasMany(Shelf, { foreignKey: "branchId" });

  // shelf has many book inventory
  Shelf.hasMany(models.BookInventory, {
    foreignKey: "shelfId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
};

module.exports = Shelf;
