// models/5_itam_management/ITItemAssignment.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ITItemAssignment = sequelize.define(
    "ITItemAssignment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nik: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      returned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      it_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "it_item_assignments",
      timestamps: false,
    },
  );

  ITItemAssignment.associate = (models) => {
    if (models.ITItem) {
      ITItemAssignment.belongsTo(models.ITItem, {
        foreignKey: "it_item_id",
        targetKey: "it_item_id",
        as: "item",
      });
    }
    if (models.HRGAUser) {
      ITItemAssignment.belongsTo(models.HRGAUser, {
        foreignKey: "nik",
        targetKey: "NIK",
        as: "user",
      });
    }
  };

  return ITItemAssignment;
};
