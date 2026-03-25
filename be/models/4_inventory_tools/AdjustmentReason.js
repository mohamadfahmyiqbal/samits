// models/4_inventory_tools/AdjustmentReason.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const AdjustmentReason = sequelize.define('AdjustmentReason', {
        reason_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        reason_description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'adjustment_reasons',
        timestamps: false,
    });

    return AdjustmentReason;
};
