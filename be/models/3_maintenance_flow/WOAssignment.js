// models/3_maintenance_flow/WOAssignment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const WOAssignment = sequelize.define('WOAssignment', {
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
        tableName: 'wo_assignments',
        timestamps: true,
    });

    return WOAssignment;
};
