// models/2_eam_core/AssetAuditLog.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssetAuditLog = sequelize.define('AssetAuditLog', {
    audit_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    it_item_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    asset_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    event_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    actor_nik: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    actor_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    source_module: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    request_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    before_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    after_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    event_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    client_ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
  }, {
    tableName: 'asset_audit_logs',
    timestamps: false,
  });

  AssetAuditLog.associate = (models) => {
    if (models.ITItem) {
      AssetAuditLog.belongsTo(models.ITItem, {
        foreignKey: 'it_item_id',
        targetKey: 'it_item_id',
        as: 'itItem',
      });
    }
  };

  return AssetAuditLog;
};

