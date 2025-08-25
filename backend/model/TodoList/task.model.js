const { sequelize } = require("../../config/dataConnection");
const { DataTypes } = require("sequelize");

const TaskModel = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 125],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "in-progress", "completed", "achieved"),
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reminderDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Optional reminder notification date",
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Estimated time in hours or minutes",
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array of file URLs or paths",
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Soft archive instead of deletion",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "tasks",
  }
);

// Associations / Relationship : TaskModel
TaskModel.associate = (models) => {
  // task belongs to user and user has many tasks
  TaskModel.belongsTo(models.UserModel, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = TaskModel;
