const { sequelize } = require("../../../config/dataConnection");
const { DataTypes } = require("sequelize");

const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    subtitle: { type: DataTypes.STRING },
    isbn: { type: DataTypes.STRING, unique: true, allowNull: false },
    author: { type: DataTypes.STRING, allowNull: false },
    publisher: { type: DataTypes.STRING },
    publishedYear: { type: DataTypes.INTEGER },
    edition: { type: DataTypes.STRING },
    categoryId: {
      type: DataTypes.INTEGER,
      references: { model: "Categories", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    language: { type: DataTypes.STRING, defaultValue: "English" },
    tags: { type: DataTypes.JSON },
    summary: { type: DataTypes.TEXT },
    coverImage: { type: DataTypes.STRING },
    accessType: {
      type: DataTypes.ENUM("public", "private", "restricted"),
      defaultValue: "public",
    },
    borrowOptions: {
      type: DataTypes.ENUM("in-library", "take-home", "both"),
      defaultValue: "in-library",
    },
  },
  {
    timestamps: true,
    tableName: "books",
  }
);

// Associations
Book.associate = (models) => {
  Book.belongsTo(models.Category, {
    foreignKey: "categoryId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  models.Category.hasMany(Book, {
    foreignKey: "categoryId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  Book.hasMany(models.BookInventory, {
    foreignKey: "bookId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = Book;
