// models/approval/ApprovalHistory.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ApprovalHistory = sequelize.define('ApprovalHistory', {
        approval_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        document_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        document_id: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        level_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approver_nik: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        step_sequence: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'approval_history',
        timestamps: false,
    });

    return ApprovalHistory;
};