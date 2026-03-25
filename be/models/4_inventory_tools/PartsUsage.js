// models/4_inventory_tools/PartsUsage.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const PartsUsage = sequelize.define('PartsUsage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        wo_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'parts_usage',
        timestamps: false,
    });

    return PartsUsage;
};
