// models/4_inventory_tools/WarehouseStock.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const WarehouseStock = sequelize.define('WarehouseStock', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        warehouse_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        qty: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'warehouse_stock',
        freezeTableName: true,
        timestamps: false,
    });

    WarehouseStock.associate = (db) => {
      if (db.Part) {
        WarehouseStock.belongsTo(db.Part, { foreignKey: 'part_id', as: 'part' });
      }
    };

    return WarehouseStock;
};
