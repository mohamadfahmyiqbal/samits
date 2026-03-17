// models/4_inventory_tools/SparePart.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const SparePart = sequelize.define('SparePart', {
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
        tableName: 'spare_parts',
        timestamps: true,
    });

    return SparePart;
};
