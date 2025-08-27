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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Unique book identifier (industry standard)
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    //	Name of the author
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    // Publishing company
    publisher: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Year the book was published
    publishedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1000,
        max: new Date().getFullYear(),
      },
    },
    // Edition info (e.g., "2nd Edition")
    edition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Foreign key linking to Category model
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "categories", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    // Language of the book (default: English)
    language: { type: DataTypes.STRING, defaultValue: "English" },

    // JSON array of keywords (e.g., ["fiction", "space", "classic"])
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // Description or synopsis of the book
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // URL or path to the book's cover image
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Controls who can view the book: public, private, or restricted
    accessType: {
      type: DataTypes.ENUM("public", "private", "restricted"),
      defaultValue: "public",
    },
    // Defines how the book can be borrowed: in-library, take-home, or both
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
