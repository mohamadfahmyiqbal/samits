// models/4_inventory_tools/Warehouse.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Warehouse = sequelize.define('Warehouse', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'warehouses',
        timestamps: true,
    });

    return Warehouse;
};
