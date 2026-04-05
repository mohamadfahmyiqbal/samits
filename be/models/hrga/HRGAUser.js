import { DataTypes } from "sequelize";

export default (sequelize) => {
  const HRGAUser = sequelize.define(
    "HRGAUser",
    {
      NIK: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
      },
      NAMA: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      DEPT: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      DIVISI: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: "USER",
      freezeTableName: true,
      timestamps: false,
    },
  );

  return HRGAUser;
};
