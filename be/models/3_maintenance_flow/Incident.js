import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Incident = sequelize.define('Incident', {
    incident_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    asset_id: {
      type: DataTypes.UUID,
      allowNull: true  // it_item_id equivalent
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    severity: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    detected_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'incidents',
    timestamps: false
  });

  Incident.associate = (models) => {
    if (models.ITItem) {
      Incident.belongsTo(models.ITItem, {
        foreignKey: 'asset_id',
        targetKey: 'it_item_id',
        as: 'asset'
      });
    }
  };

  return Incident;
};

