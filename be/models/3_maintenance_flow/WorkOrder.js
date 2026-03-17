// models/3_maintenance_flow/WorkOrder.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const WorkOrder = sequelize.define('WorkOrder', {
        wo_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'wo_id'
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: DataTypes.TEXT,
        asset_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(50),
            defaultValue: 'open'
        },
        priority: {
            type: DataTypes.STRING(20),
            defaultValue: 'medium'
        },
        assigned_to_nik: DataTypes.STRING(20),
        category: DataTypes.STRING(50),
        scheduled_date: DataTypes.DATE,
        completed_at: DataTypes.DATE,
    }, {
        tableName: 'work_orders',
        timestamps: true,
        fieldMap: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    });

    return WorkOrder;
};
