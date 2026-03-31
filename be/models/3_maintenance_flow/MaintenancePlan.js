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
      it_item_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      plan_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      scheduled_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      pic: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: "pending",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      maintenance_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      hostname: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      scheduled_start_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      scheduled_end_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "critical"),
        allowNull: true,
        defaultValue: "medium",
      },
      criticality: {
        type: DataTypes.ENUM("low", "medium", "high"),
        allowNull: true,
        defaultValue: "medium",
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      required_skills: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      estimated_duration: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        defaultValue: 2.0,
      },
      asset_main_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sub_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      recurrence: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      recurrence_interval: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      recurrence_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      recurrence_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      schedule_rule: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      tableName: "maintenance_plans",
      timestamps: false,
      underscored: true,
    },
  );

  MaintenancePlan.associate = (models) => {
    MaintenancePlan.hasMany(models.WorkOrder, {
      foreignKey: "plan_id",
      as: "workOrders",
    });

    if (models.MaintenancePlanAsset) {
      MaintenancePlan.hasMany(models.MaintenancePlanAsset, {
        foreignKey: "plan_id",
        as: "assets",
      });
    }
  };

  return MaintenancePlan;
};
