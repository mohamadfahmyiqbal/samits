import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssetDepreciation = sequelize.define('AssetDepreciation', {
    depreciation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    it_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ITItem',
        key: 'it_item_id'
      }
    },
    period: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    depreciation_value: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    accumulated_value: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'asset_depreciations',
    timestamps: false
  });

  AssetDepreciation.associate = (models) => {
    if (models.ITItem) {
      AssetDepreciation.belongsTo(models.ITItem, {
        foreignKey: 'it_item_id',
        as: 'item'
      });
    }
  };

  return AssetDepreciation;
};

