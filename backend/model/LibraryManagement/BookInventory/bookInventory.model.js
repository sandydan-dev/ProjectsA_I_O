const { sequelize } = require("../../../config/dataConnection");
const { DataTypes } = require("sequelize");

const BookInventory = sequelize.define(
  "BookInventory",
  {
    //Unique identifier for each inventory record.
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // Foreign key to books table. Links to the specific book being tracked.
    bookId: {
      type: DataTypes.INTEGER,
      references: { model: "books", key: "id" },
      allowNull: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // Foreign key to library_branches. Indicates which branch holds the book.
    branchId: {
      type: DataTypes.INTEGER,
      references: { model: "library_branches", key: "id" },
      allowNull: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // Foreign key to shelves. Optional. Specifies the shelf location within the branch.
    shelfId: {
      type: DataTypes.INTEGER,
      references: { model: "shelves", key: "id" },
      allowNull: true,
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    //Unique identifier for physical tracking. Must be present and unique.
    barcode: { type: DataTypes.STRING, unique: true, allowNull: false },
    // Library classification code (e.g., Dewey Decimal). Helps locate the book.
    callNumber: { type: DataTypes.STRING },
    // When the book was added to the inventory. Useful for audit and aging reports.
    acquisitionDate: { type: DataTypes.DATE },
    // Purchase cost. Can be used for valuation or budgeting.
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    // Default "New". Tracks wear and tear (e.g., "Good", "Damaged").
    condition: { type: DataTypes.STRING, defaultValue: "New" },
    // If true, book cannot be borrowed. Used for encyclopedias, rare books, etc. not for sell
    referenceOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Total number of copies of this book at this branch.
    totalCopies: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },

    // How many are currently available for borrowing.
    availableCopies: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
    // If true, borrowing needs special approval.
    requiresPermission: { type: DataTypes.BOOLEAN, defaultValue: false },

    // Defines the type of permission required.
    permissionType: {
      type: DataTypes.ENUM("signature", "token"),
      allowNull: true,
    },
    // track who added the inventory
    createdBy: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  },
  { timestamps: true, tableName: "book_inventories" }
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
