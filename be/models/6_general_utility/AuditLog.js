// models/6_general_utility/AuditLog.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const AuditLog = sequelize.define('AuditLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'audit_logs',
        timestamps: true,
    });

    return AuditLog;
};
