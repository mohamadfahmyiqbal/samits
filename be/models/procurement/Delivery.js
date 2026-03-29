import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Delivery = sequelize.define('Delivery', {
    delivery_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    po_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    delivery_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    received_by: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'deliveries',
    timestamps: false
  });

  Delivery.associate = (models) => {
    if (models.DeliveryItem) {
      Delivery.hasMany(models.DeliveryItem, {
        foreignKey: 'delivery_id',
        as: 'items'
      });
    }
    // Add PO association if PO model exists
  };

  return Delivery;
};

