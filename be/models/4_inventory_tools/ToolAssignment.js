// models/4_inventory_tools/ToolAssignment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ToolAssignment = sequelize.define('ToolAssignment', {
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
        tableName: 'tool_assignments',
        timestamps: true,
    });

    return ToolAssignment;
};
