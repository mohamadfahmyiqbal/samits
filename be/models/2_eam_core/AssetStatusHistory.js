// models/2_eam_core/AssetStatusHistory.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssetStatusHistory = sequelize.define('AssetStatusHistory', {
    history_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    it_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    old_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    new_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    changed_by_nik: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    changed_by_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    changed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'asset_status_history',
    timestamps: false,
  });

  AssetStatusHistory.associate = (models) => {
    if (models.ITItem) {
      AssetStatusHistory.belongsTo(models.ITItem, {
        foreignKey: 'it_item_id',
        targetKey: 'it_item_id',
        as: 'itItem',
      });
    }
  };

  return AssetStatusHistory;
};

