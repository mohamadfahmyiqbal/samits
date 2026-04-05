// models/5_itam_management/SecurityEvent.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const SecurityEvent = sequelize.define('SecurityEvent', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'security_events',
        timestamps: true,
    });

    return SecurityEvent;
};
