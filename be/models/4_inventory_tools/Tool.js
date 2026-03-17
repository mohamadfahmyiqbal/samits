// models/4_inventory_tools/Tool.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Tool = sequelize.define('Tool', {
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
        tableName: 'tools',
        timestamps: true,
    });

    return Tool;
};
