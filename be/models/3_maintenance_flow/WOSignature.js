// models/3_maintenance_flow/WOSignature.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const WOSignature = sequelize.define('WOSignature', {
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
        tableName: 'wo_signatures',
        timestamps: true,
    });

    return WOSignature;
};
