const { sequelize } = require("../../../config/dataConnection");
const { DataTypes } = require("sequelize");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
     name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100], // optional: enforce reasonable length
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "categories",
  }
);

// Associations
Category.associate = (models) => {
    // category has many books
  Category.hasMany(models.Book, {
    foreignKey: "categoryId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
};

module.exports = Category;
