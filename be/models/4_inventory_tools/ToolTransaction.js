// models/4_inventory_tools/ToolTransaction.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ToolTransaction = sequelize.define('ToolTransaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tool_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'tool_transactions',
        timestamps: true,
    });

    return ToolTransaction;
};
