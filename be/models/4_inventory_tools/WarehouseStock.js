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
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'warehouse_stocks',
        timestamps: true,
    });

    return WarehouseStock;
};
