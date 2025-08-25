const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/dataConnection.js");

const ContactManagerModel = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // must match UserModel table name
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: "Invalid email format" },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false, // store ID, name, or email of creator
    },
  },
  {
    timestamps: true,
    tableName: "contacts",
  }
);

// Associations / Relationship
ContactManagerModel.associate = (models) => {
  // A contact belongs to a user
  ContactManagerModel.belongsTo(models.UserModel, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = ContactManagerModel;
