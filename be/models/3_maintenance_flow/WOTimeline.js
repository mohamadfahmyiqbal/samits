// models/3_maintenance_flow/WOTimeline.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const WOTimeline = sequelize.define('WOTimeline', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        workorder_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'wo_timelines',
        timestamps: true,
    });

    return WOTimeline;
};
