import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssetDisposal = sequelize.define('AssetDisposal', {
    disposal_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    it_item_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'ITItem',
        key: 'it_item_id'
      }
    },
    ba_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    disposal_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    reason_disposal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    proposed_method: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    net_book_value: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    nbv_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    acc_depreciation: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    evidence_photo_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status_disposal: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'asset_disposals',
    timestamps: false
  });

  AssetDisposal.associate = (models) => {
    if (models.ITItem) {
      AssetDisposal.belongsTo(models.ITItem, {
        foreignKey: 'it_item_id',
        as: 'item'
      });
    }
  };

  return AssetDisposal;
};

