// models/1_user_management/UserRole.js - Updated to match actual DB schema
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UserRole = sequelize.define(
    "UserRole",
    {
      // PK auto-increment (sama seperti struktur actual DB)
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // NIK sebagai varchar(30) - match actual DB
      nik: {
        type: DataTypes.STRING(30),
        allowNull: false,
        references: {
          model: "users",
          key: "nik",
        },
      },
      // Role ID
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "role_id",
        },
      },
    },
    {
      tableName: "user_roles",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["nik", "role_id"],
        },
      ],
    },
  );

  return UserRole;
};
