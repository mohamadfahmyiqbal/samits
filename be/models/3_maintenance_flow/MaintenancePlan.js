// models/3_maintenance_flow/MaintenancePlan.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const MaintenancePlan = sequelize.define(
    "MaintenancePlan",
    {
      plan_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      plan_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      plan_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      frequency: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      next_due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      tableName: "maintenance_plans",
      timestamps: false,
      underscored: true,
    },
  );

  return MaintenancePlan;
};
