// models/2_eam_core/AssetStatus.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssetStatus = sequelize.define('AssetStatus', {
    status_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'status_id'
    },
    status_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'status_name'
    },
    status_description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'status_description'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    is_disposed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_disposed'
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'asset_status',
    timestamps: false
  });

  return AssetStatus;
};

