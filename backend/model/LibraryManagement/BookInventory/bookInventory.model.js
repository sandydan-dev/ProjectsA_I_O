const { sequelize } = require("../../../config/dataConnection");
const { DataTypes } = require("sequelize");

const BookInventory = sequelize.define(
  "BookInventory",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookId: {
      type: DataTypes.INTEGER,
      references: { model: "books", key: "id" },
      allowNull: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    branchId: {
      type: DataTypes.INTEGER,
      references: { model: "library_branches", key: "id" },
      allowNull: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    shelfId: {
      type: DataTypes.INTEGER,
      references: { model: "shelfs", key: "id" },
      allowNull: true,
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    barcode: { type: DataTypes.STRING, unique: true },
    callNumber: { type: DataTypes.STRING },
    acquisitionDate: { type: DataTypes.DATE },
    price: { type: DataTypes.FLOAT },
    condition: { type: DataTypes.STRING, defaultValue: "New" },
    referenceOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
    totalCopies: { type: DataTypes.INTEGER, defaultValue: 1 },
    availableCopies: { type: DataTypes.INTEGER, defaultValue: 1 },
    requiresPermission: { type: DataTypes.BOOLEAN, defaultValue: false },
    permissionType: { type: DataTypes.ENUM("signature", "token") },
  },
  { timestamps: true, tableName : "book_inventories" }
);

BookInventory.associate = (models) => {
  BookInventory.belongsTo(models.Book, { foreignKey: "bookId" });
  BookInventory.belongsTo(models.LibraryBranch, { foreignKey: "branchId" });
  BookInventory.belongsTo(models.Shelf, { foreignKey: "shelfId" });

  models.Book.hasMany(BookInventory, { foreignKey: "bookId" });
  models.LibraryBranch.hasMany(BookInventory, { foreignKey: "branchId" });
  models.Shelf.hasMany(BookInventory, { foreignKey: "shelfId" });
};

module.exports = BookInventory;
