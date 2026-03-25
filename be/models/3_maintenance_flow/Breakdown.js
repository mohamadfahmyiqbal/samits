// models/3_maintenance_flow/Breakdown.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Breakdown = sequelize.define('Breakdown', {
        breakdown_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        asset_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        detected_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        wo_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'breakdowns',
        timestamps: false,
    });

    return Breakdown;
};
