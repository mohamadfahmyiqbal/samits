// models/3_maintenance_flow/MeterReading.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const MeterReading = sequelize.define('MeterReading', {
        reading_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        asset_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wo_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        meter_value: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        reading_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'meter_readings',
        timestamps: false,
    });

    return MeterReading;
};
