const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/dataConnection.js");

const UserModel = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    role: {
      type: DataTypes.ENUM(
        "admin",
        "superadmin",
        "staff",
        "employee",
        "manager",
        "student",
        "regular"
      ),
      defaultValue: "regular",
    },
    privilegedId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "users",
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
  }
);

// Associations / Relationship : UserModel
UserModel.associate = (models) => {
  // user has many tasks, task belongs to user
  UserModel.hasMany(models.TaskModel, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // user has many contacts, contact belongs to user
  UserModel.hasMany(models.ContactManagerModel, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = UserModel;
