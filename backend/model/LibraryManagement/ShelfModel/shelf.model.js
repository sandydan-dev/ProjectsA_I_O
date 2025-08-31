const { sequelize } = require("../../../config/dataConnection");
const { DataTypes } = require("sequelize");

const Shelf = sequelize.define(
  "Shelf",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // gives branch id unque id for every shelfs, remove duplicates
    branchId: {
      type: DataTypes.INTEGER,
      references: { model: "library_branches", key: "id" },
      allowNull: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // library floor number
    floor: { type: DataTypes.STRING, allowNull: true },
    // section of the shelf
    section: { type: DataTypes.STRING, allowNull: true },
    // section row
    row: { type: DataTypes.STRING, allowNull: true },
    // unque identity for shelf lable
    shelfLabel: { type: DataTypes.STRING, allowNull: true },

    // if shelf empty or not
    status: {
      type: DataTypes.ENUM("Empty", "Occupied", "Full"),
      defaultValue: "Empty",
    },
    // section books quantity
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    // current number of books stored
    currentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // category of books/ already have category BookCategoryModel
    // category (link with Category model instead of plain string)
    categoryId: {
      type: DataTypes.INTEGER,
      references: { model: "categories", key: "id" },
      allowNull: true,
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    // barcode/unique code /qrcode which have all info about section
    locationCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    // is working or not
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
  Shelf.belongsTo(models.LibraryBranchModel, {
    foreignKey: "branchId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  models.LibraryBranchModel.hasMany(models.ShelfModel, {
    foreignKey: "branchId",
  });

  // Shelf belongs to Category
  Shelf.belongsTo(models.CategoryModel, {
    foreignKey: "categoryId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  models.CategoryModel.hasMany(models.ShelfModel, {
    foreignKey: "categoryId",
  });
  // shelf has many book inventory
  Shelf.hasMany(models.BookInventoryModel, {
    foreignKey: "shelfId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
};

module.exports = Shelf;
