// models/3_maintenance_flow/WOTaskResult.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const WOTaskResult = sequelize.define('WOTaskResult', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        task_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'wo_task_results',
        timestamps: true,
    });

    return WOTaskResult;
};
