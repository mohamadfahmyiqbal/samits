import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const DeliveryItem = sequelize.define('DeliveryItem', {
    delivery_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    delivery_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'delivery_items',
    timestamps: false
  });

  DeliveryItem.associate = (models) => {
    if (models.Delivery) {
      DeliveryItem.belongsTo(models.Delivery, {
        foreignKey: 'delivery_id',
        as: 'delivery'
      });
    }
  };

  return DeliveryItem;
};

