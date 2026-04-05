import { DataTypes } from "sequelize";

export default (sequelize) => {
  const MaintenancePlanAsset = sequelize.define(
    "MaintenancePlanAsset",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      it_item_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      hostname: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      asset_tag: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("GETDATE()"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("GETDATE()"),
      },
    },
    {
      tableName: "maintenance_plan_assets",
      timestamps: false,
      underscored: true,
    },
  );

  MaintenancePlanAsset.associate = (models) => {
    if (models.MaintenancePlan) {
      MaintenancePlanAsset.belongsTo(models.MaintenancePlan, {
        foreignKey: "plan_id",
        as: "plan",
      });
    }

    if (models.ITItem) {
      MaintenancePlanAsset.belongsTo(models.ITItem, {
        foreignKey: "it_item_id",
        as: "itItem",
      });
    }
  };

  return MaintenancePlanAsset;
};
