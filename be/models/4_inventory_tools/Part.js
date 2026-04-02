import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Part = sequelize.define(
    'Part',
    {
      part_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      part_code: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      part_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      part_category: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      minimum_stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      purchase_period: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: 'parts',
      timestamps: false,
    },
  );

  Part.associate = (db) => {
    if (db.WarehouseStock) {
      Part.hasMany(db.WarehouseStock, { foreignKey: 'part_id', as: 'warehouseStocks' });
    }
  };

  return Part;
};
