const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/dataConnection.js");
const crypto = require("crypto");

const UserModel = sequelize.define(
  "User",
  {
    //todo: 🆔 Identity & Authentication
    //*: Generate Unque Id for all new users
    id: {
      //✅
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    //* Name of user
    name: {
      //✅
      type: DataTypes.STRING,
      allowNull: false, // mandatory
    },
    //todo: 🔑 Credentials for login email, password
    //* Login email for user
    email: {
      //✅
      type: DataTypes.STRING,
      unique: true,
      allowNull: false, // mandatory
      validate: { isEmail: true },
    },
    //* password for login
    password: {
      //✅
      type: DataTypes.STRING,
      allowNull: false, // mandatory
    },
    //* User mobile number
    mobile: {
      //✅
      type: DataTypes.STRING,
      allowNull: false, // mandatory
    },
    //* Passphoto for user
    profilePhoto: {
      //✅
      type: DataTypes.STRING,
      allowNull: true, // Optional
      defaultValue: null,
    },
    //todo: 🤼‍♂️ Roles & Privileg
    //* User roles identify
    role: {
      //✅
      type: DataTypes.ENUM(
        "admin",
        "superadmin",
        "employee",
        "manager",
        "student",
        "regular",
        "staff",
        "librarian",
        "members",
        "assistant"
      ),
      defaultValue: "regular",
    },
    //* Unique ID for admin and superadmin, full controll
    privilegedId: {
      //✅
      type: DataTypes.STRING,
      allowNull: true, // mandatory for only admin/superadmin
      defaultValue: null,
    },
    //todo: 📧 Email Verification & Changes
    //* User verify email then login
    isEmailVerified: {
      //✅
      type: DataTypes.BOOLEAN,
      defaultValue: false, // mandatory
    },
    //* generate token for email verification
    emailVerificationToken: {
      //✅
      type: DataTypes.STRING,
      allowNull: true, // optional
    },
    //* User email expires data/time , token expiry
    emailVerificationExpires: {
      //✅
      type: DataTypes.DATE,
      allowNull: true, // optional
    },
    //* See email verification date/time
    emailVerifiedAt: {
      //✅
      type: DataTypes.DATE,
      allowNull: true, // optional
    },

    //todo: 🔄 Email Change Flow
    //* new email request
    emailChangeRequested: {
      //✅
      type: DataTypes.STRING,
      allowNull: true, // optional
    },
    //* token to confirm check
    emailChangeToken: {
      //✅
      type: DataTypes.STRING,
      allowNull: true, // optional
    },
    //* expiry of token change
    emailChangeExpires: {
      //✅
      type: DataTypes.DATE,
      allowNull: true, // optional
    },

    //todo: 📬 Email Delivery & Preferences
    //* failed delivery attampts
    emailBounceCount: {
      //✅
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    //* unsubscribe or blocked
    // Optional. Use it to block sending emails to users who unsubscribed or bounced. Not needed for practice.
    // emailSuppressed: {
    //   //✅
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: false,
    // },
    // Optional but useful. Lets users choose what types of emails they want (e.g. newsletter, alerts). Great for simulating real-world email settings.
    // emailPreferences: {
    //   type: DataTypes.JSON,
    //   allowNull: true,
    //   defaultValue: null, // or leave out defaultValue entirely
    // },

    //todo: 🚫 Ban Management
    isBanned: {
      //✅
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    banReason: {
      //✅
      type: DataTypes.STRING,
      allowNull: true,
    },
    bannedBy: {
      //✅
      type: DataTypes.JSON, // e.g. { id: 1, name: 'Admin' }
      allowNull: true, // optional
    },
    bannedAt: {
      //✅
      type: DataTypes.DATE,
      allowNull: true,
    },
    banExpiresAt: {
      //✅
      type: DataTypes.DATE,
      allowNull: true, // optional
    },

    //todo: ⏸ Suspension Management
    //* for temporory suspend
    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // true = user is suspended
    },

    //* Reason for banned
    suspendReason: {
      type: DataTypes.STRING,
      allowNull: true, // message shown to user
    },

    //* track who suspended by
    suspendedBy: {
      type: DataTypes.JSON, // e.g. { id: 2, name: 'Moderator' }
      allowNull: true, //optional /who suspended the user
    },

    //* track suspend time/date
    suspendedAt: {
      type: DataTypes.DATE,
      allowNull: true, //optional/ when suspension was applied
    },
    //* expiry for temporary suspensions
    suspendExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true, // optional
    },
    //todo: 🧠 Audit & Metadata
    //* soft delete flag
    isDeleted: {
      //✅
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    //* tracks who created the user
    createdBy: {
      //✅
      type: DataTypes.JSON,
      allowNull: false,
    },
    //* tracks last login time
    lastLoginAt: {
      //✅
      type: DataTypes.DATE,
      allowNull: true, // optional
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

// 🔄 Hook: Before creating a new user
UserModel.beforeCreate((user, options) => {
  console.log("[HOOK] beforeCreate triggered for user:", user.email);

  // Generate email verification token if not verified
  if (!user.isEmailVerified) {
    user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    console.log(
      "[HOOK] Email verification token generated:",
      user.emailVerificationToken
    );
  }

  // Generate email change token if requested
  if (user.emailChangeRequested) {
    user.emailChangeToken = crypto.randomBytes(32).toString("hex");
    user.emailChangeExpires = new Date(Date.now() + 15 * 60 * 1000);
    console.log("[HOOK] Email change token generated:", user.emailChangeToken);
  }
});

// 🔄 Hook: Before updating an existing user
UserModel.beforeUpdate((user, options) => {
  console.log("[HOOK] beforeUpdate triggered for user:", user.email);

  // Regenerate email verification token if email is unverified
  if (!user.isEmailVerified && !user.emailVerificationToken) {
    user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    console.log(
      "[HOOK] Email verification token regenerated:",
      user.emailVerificationToken
    );
  }

  // Regenerate email change token if new email is requested
  if (user.emailChangeRequested && !user.emailChangeToken) {
    user.emailChangeToken = crypto.randomBytes(32).toString("hex");
    user.emailChangeExpires = new Date(Date.now() + 15 * 60 * 1000);
    console.log(
      "[HOOK] Email change token regenerated:",
      user.emailChangeToken
    );
  }
});

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
