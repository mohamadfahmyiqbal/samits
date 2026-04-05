// models/1_user_management/User.js - Updated to match actual DB schema
import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      nik: {
        // Match actual DB: varchar(30)
        type: DataTypes.STRING(30),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      // Match actual DB: varchar(30)
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      // Match actual DB: varchar(100)
      position: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      // Match actual DB: varchar(20) - bukan DATE
      status: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    },
  );

  User.associate = (models) => {
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: "nik",
      otherKey: "role_id",
      as: "roles",
    });
  };

  return User;
};
